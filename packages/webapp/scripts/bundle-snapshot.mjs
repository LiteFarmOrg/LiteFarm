#!/usr/bin/env node
//
// Measure one build of the webapp and write one JSON snapshot.
//
// Usage, output fields and failure messages: ../bundle-snapshots/README.md
//

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const SCHEMA = 2;

// Matches `gzip_comp_level` and `gzip_min_length` in packages/webapp/nginx.conf.
const GZIP_LEVEL = 6;
const GZIP_MIN_LENGTH = 1024;

// The extensions whose content type is in `gzip_types` in packages/webapp/nginx.conf, plus
// text/html, which nginx always compresses. `image/svg+xml` is the only image type in that list.
// No font type is, and neither is the application/manifest+json that the `types` block in that
// file gives `.webmanifest`.
const COMPRESSED_EXTENSIONS = new Set(['.css', '.html', '.js', '.json', '.svg', '.txt', '.xml']);

// The extensions a substituted `import.meta.env` can end up in, scanned for environment key names
const SUBSTITUTED_EXTENSIONS = new Set(['.css', '.html', '.js']);

// Asserted to appear in the built output on every run. If it does not, the environment override
// below did not take effect and the snapshot describes an unknown environment.
const SENTINEL_API_URL = 'https://snapshot.invalid';

// Keys the deployed builds have a value for. All values here are dummies; none is secret. `NODE_ENV` is
// set because Vite otherwise takes it from the developer's `.env`
const PINNED_ENV = {
  NODE_ENV: 'production',
  VITE_API_URL: SENTINEL_API_URL,
  VITE_DO_BUCKET_NAME: 'litefarm',
  VITE_ENV: 'production',
  VITE_GOOGLE_MAPS_API_KEY: 'snapshot-google-maps-api-key',
  VITE_GOOGLE_OAUTH_CLIENT_ID: 'snapshot-google-oauth-client-id',
  VITE_SENTRY_DSN: 'https://snapshot@snapshot.invalid/0',
  VITE_SURVEY_GROUP_ID: 'snapshot-survey-group-id',
};

// Keys only a local `.env` would carry, blanked because an unset key falls back to that file.
const BLANKED_ENV = {
  VITE_DEV_BUCKET_NAME: '',
  VITE_DEV_ENDPOINT: '',
  VITE_NGROK_API: '',
};

const WEBAPP = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(WEBAPP, 'dist');
const SRC = join(WEBAPP, 'src');
const LOCAL_DIR = join(WEBAPP, '.bundle-snapshots');
const RELEASE_DIR = join(WEBAPP, 'bundle-snapshots');
const VITE_PACKAGE = join(WEBAPP, 'node_modules', 'vite', 'package.json');

const PUBLIC = join(WEBAPP, 'public');

// macOS recreates `.DS_Store` as soon as a folder is opened
const REGENERATED = new Set(['.DS_Store']);

// `public/` is copied into `dist` wholesale, so a file git ignores there is measured locally
// but absent from every deployed build; will be skipped in snapshot
const LOCAL_ONLY = ignoredUnderPublic();

// The one glob that reaches public/ is `public/locales/{lng}/*.json` via `src/locales/i18n.js`. An
// ignored file it matches becomes a chunk in dist that can't then be matched; existence will stop build
const BUNDLED_LOCAL = [...LOCAL_ONLY].filter((url) => /^\/locales\/[^/]+\/[^/]+\.json$/.test(url));

const LOCALE_NAMESPACES = new Set(
  readdirSync(join(PUBLIC, 'locales', 'en'))
    .filter((name) => name.endsWith('.json'))
    .filter((name) => !LOCAL_ONLY.has(`/locales/en/${name}`))
    .map((name) => name.slice(0, -'.json'.length)),
);

// The `-<hash>` Rollup inserts before the extension. Matches both
// Rollup 3 (`crop-0de75771.js`) and Rollup 4 (`index-BfFsbPPC.js`)
const HASH_PATTERN = /-([A-Za-z0-9_-]{8})(?=\.[^/]*$)/;

const IMAGE_PATTERN = /\.(avif|gif|ico|jpe?g|png|webp)$/;
const FONT_PATTERN = /\.(eot|otf|ttf|woff2?)$/;

// The path `src/locales/i18n.js` gives HttpBackend as a `loadPath`
const TRANSLATION_JSON_PATTERN = /^\/locales\/.+\.json$/;

// A key name on its own: the leading guard rejects the tail of a longer identifier, such as the
// `VITE_USER` inside `INVITE_USER`
const ENV_KEY_PATTERN = /(?<![A-Za-z0-9_$])VITE_[A-Z0-9_]+/g;

function fail(message) {
  console.error(`bundle-snapshot: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const options = { release: false, label: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--release') {
      options.release = true;
    } else if (arg === '--label') {
      options.label = argv[++i];
      if (!options.label) {
        fail('--label needs a value');
      }
    } else {
      fail(`unknown argument ${arg}`);
    }
  }
  if (options.label && !/^[a-z0-9][a-z0-9._-]*$/i.test(options.label)) {
    fail(`--label must be filename-safe, got ${options.label}`);
  }
  return options;
}

function git(args) {
  const result = spawnSync('git', args, { cwd: WEBAPP, encoding: 'utf8' });
  if (result.status !== 0) {
    fail(`git ${args.join(' ')} failed: ${(result.stderr || '').trim()}`);
  }
  return result.stdout.trimEnd();
}

/** Working-tree state. `dirtyPaths` is printed, never written into the snapshot. */
function commitInfo() {
  const dirtyPaths = git(['status', '--porcelain'])
    .split('\n')
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .sort();
  return {
    sha: git(['rev-parse', 'HEAD']),
    shortSha: git(['rev-parse', '--short', 'HEAD']),
    branch: git(['rev-parse', '--abbrev-ref', 'HEAD']),
    dirty: dirtyPaths.length > 0,
    dirtyPaths,
  };
}

/** The Vite version that decided the chunk layout */
function viteVersion() {
  if (!existsSync(VITE_PACKAGE)) {
    fail('node_modules/vite is missing, so the Vite version cannot be recorded. Run pnpm install.');
  }
  return JSON.parse(readFileSync(VITE_PACKAGE, 'utf8')).version;
}

function walk(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (REGENERATED.has(entry.name)) {
      continue;
    }
    if (entry.isDirectory()) {
      found.push(...walk(path));
    } else if (entry.isFile()) {
      found.push(path);
    }
  }
  return found;
}

/**
 * The files under `public/` that git ignores, as URLs. `git check-ignore` exits 0 and returns the
 * matches on stdout when it matches something, and 1 when it matches nothing
 */
function ignoredUnderPublic() {
  if (!existsSync(PUBLIC)) {
    return new Set();
  }
  const paths = walk(PUBLIC);
  const result = spawnSync('git', ['check-ignore', '--stdin'], {
    cwd: WEBAPP,
    encoding: 'utf8',
    input: paths.join('\n'),
  });
  if (result.error || result.status === null || result.status > 1) {
    fail(`git check-ignore failed: ${(result.stderr || result.error?.message || '').trim()}`);
  }
  return new Set(
    result.stdout
      .split('\n')
      .filter(Boolean)
      .map((path) => normaliseUrl(relative(PUBLIC, path))),
  );
}

function accountedFor(key) {
  return key in PINNED_ENV || key in BLANKED_ENV;
}

/** Every `import.meta.env.VITE_*` key read under src/ must be given a value or blanked. */
function assertEnvExhaustive() {
  const used = new Set();
  for (const path of walk(SRC)) {
    if (!/\.(js|jsx|ts|tsx)$/.test(path)) {
      continue;
    }
    for (const match of readFileSync(path, 'utf8').matchAll(
      /import\.meta\.env\.(VITE_[A-Z0-9_]+)/g,
    )) {
      used.add(match[1]);
    }
  }
  const unaccounted = [...used].filter((key) => !accountedFor(key)).sort();
  if (unaccounted.length) {
    fail(
      `src/ reads ${unaccounted.join(', ')}, which the pinned environment does not account for. ` +
        'Add each to PINNED_ENV in this file if a deployed build sets it, and to BLANKED_ENV if ' +
        'only a local .env carries it.',
    );
  }
}

function envFingerprint() {
  const pin = { ...PINNED_ENV, ...BLANKED_ENV };
  const canonical = Object.keys(pin)
    .sort()
    .map((key) => `${key}=${pin[key]}`)
    .join('\n');
  return createHash('sha256').update(canonical).digest('hex');
}

function runBuild() {
  console.log('bundle-snapshot: building with the pinned environment (this takes minutes)');
  const result = spawnSync('pnpm', ['build'], {
    cwd: WEBAPP,
    stdio: 'inherit',
    env: { ...process.env, ...PINNED_ENV, ...BLANKED_ENV },
  });
  if (result.status !== 0) {
    fail('the build failed');
  }
}

/** Precache manifest URLs, and their revisions, from the built sw.js. */
function readManifest() {
  const source = readFileSync(join(DIST, 'sw.js'), 'utf8');
  const entries = new Map();
  for (const match of source.matchAll(/\{"revision":(null|"[^"]*"),"url":"([^"]+)"\}/g)) {
    entries.set(normaliseUrl(match[2]), match[1] === 'null' ? null : JSON.parse(match[1]));
  }
  if (!entries.size) {
    fail('the precache manifest in dist/sw.js is empty or could not be parsed');
  }
  return entries;
}

function normaliseUrl(url) {
  return `/${url.replace(/^\.?\//, '')}`;
}

/**
 * `/assets/` is the only directory Vite hashes. Elsewhere a hyphen and eight characters belong to
 * the filename, as in `/crop-images/maize-ordinary.jpg`.
 */
function splitHash(url) {
  const match = url.startsWith('/assets/') ? url.match(HASH_PATTERN) : null;
  return {
    hash: match ? match[1] : null,
    stableName: match ? url.replace(HASH_PATTERN, '') : url,
  };
}

/** What nginx puts on the wire: the gzipped body only when it compresses that type at that size. */
function transferSize(url, raw, gz) {
  return COMPRESSED_EXTENSIONS.has(extname(url)) && raw >= GZIP_MIN_LENGTH ? gz : raw;
}

function categorise(url, stableName) {
  const ext = extname(url);
  if (ext === '.svg') {
    return 'svg';
  }
  if (ext === '.css') {
    return 'css';
  }
  if (IMAGE_PATTERN.test(url)) {
    return 'image';
  }
  if (FONT_PATTERN.test(url)) {
    return 'font';
  }
  if (TRANSLATION_JSON_PATTERN.test(url)) {
    return 'translation json';
  }
  if (ext !== '.js') {
    return 'other static';
  }
  if (url === '/sw.js') {
    return 'service worker';
  }
  const chunkName = stableName.match(/^\/assets\/(.+)\.js$/)?.[1];
  if (chunkName && LOCALE_NAMESPACES.has(chunkName)) {
    return 'locale chunk';
  }
  if (stableName.startsWith('/assets/survey-vendor')) {
    return 'survey-vendor';
  }
  if (stableName.startsWith('/assets/framework-vendor')) {
    return 'framework-vendor';
  }
  return 'js chunk';
}

/** The module chunks `index.html` loads directly */
function entryUrls() {
  const html = join(DIST, 'index.html');
  if (!existsSync(html)) {
    fail('dist/index.html is missing, so the entry chunks cannot be identified');
  }
  const source = readFileSync(html, 'utf8');
  const urls = [...source.matchAll(/<script\b[^>]*>/g)]
    .map((match) => match[0])
    .filter((tag) => /type="module"/.test(tag))
    .map((tag) => tag.match(/src="([^"]+)"/)?.[1])
    .filter(Boolean)
    .map(normaliseUrl);
  if (!urls.length) {
    fail(
      'no module script tag in dist/index.html carries a src, so the entry chunks cannot be ' +
        'identified. Update the pattern in entryUrls().',
    );
  }
  return new Set(urls);
}

function measure(manifest) {
  const files = [];
  const envKeysInOutput = new Set();
  let sentinelSeen = false;

  for (const path of walk(DIST)) {
    // No user downloads a sourcemap: a browser requests one only when DevTools is open, and they
    // are not in the precache manifest
    if (extname(path) === '.map') {
      continue;
    }
    const url = normaliseUrl(relative(DIST, path));
    if (LOCAL_ONLY.has(url)) {
      continue;
    }
    const { hash, stableName } = splitHash(url);
    const category = categorise(url, stableName);
    const bytes = readFileSync(path);

    if (bytes.includes(SENTINEL_API_URL)) {
      sentinelSeen = true;
    }
    if (SUBSTITUTED_EXTENSIONS.has(extname(url))) {
      for (const key of bytes.toString('latin1').matchAll(ENV_KEY_PATTERN)) {
        envKeysInOutput.add(key[0]);
      }
    }
    if (url.startsWith('/assets/') && stableName === url) {
      fail(
        `${url} is under /assets/ but carries no recognised content hash. ` +
          'The hash pattern in this file misses the current filename format.',
      );
    }

    const raw = bytes.length;
    const gz = gzipSync(bytes, { level: GZIP_LEVEL }).length;
    files.push({
      url,
      stableName,
      hash,
      raw,
      gz,
      transfer: transferSize(url, raw, gz),
      category,
      precached: manifest.has(url),
      revision: manifest.get(url) ?? null,
    });
  }

  if (!sentinelSeen) {
    fail(
      `${SENTINEL_API_URL} does not appear in the built output, so the pinned environment did ` +
        'not reach the build. The snapshot would describe an unknown environment.',
    );
  }

  const unaccounted = [...envKeysInOutput].filter((key) => !accountedFor(key)).sort();
  if (unaccounted.length) {
    fail(
      `the built output names ${unaccounted.join(', ')}, which the pinned environment does not ` +
        'account for. Vite writes a bare import.meta.env as the whole environment object, keys ' +
        'included, so those values came from the .env on this machine and no other checkout ' +
        'reproduces this measurement. Add each key to PINNED_ENV or BLANKED_ENV in this file.',
    );
  }

  const known = new Set(files.map((file) => file.url));
  const missing = [...manifest.keys()].filter((url) => !known.has(url) && !LOCAL_ONLY.has(url));
  if (missing.length) {
    fail(`the precache manifest lists files that are not in dist: ${missing.join(', ')}`);
  }

  files.sort((a, b) => (a.url < b.url ? -1 : a.url > b.url ? 1 : 0));
  return files;
}

function total(files) {
  return files.reduce(
    (acc, file) => ({
      files: acc.files + 1,
      raw: acc.raw + file.raw,
      gz: acc.gz + file.gz,
      transfer: acc.transfer + file.transfer,
    }),
    { files: 0, raw: 0, gz: 0, transfer: 0 },
  );
}

/** Every measured file is in exactly one of these. Sourcemaps are not measured. */
function totals(files) {
  return {
    precached: total(files.filter((file) => file.precached)),
    onDemand: total(files.filter((file) => !file.precached)),
  };
}

function mb(bytes) {
  return (bytes / 1024 ** 2).toFixed(2);
}

function listPaths(paths) {
  return paths.map((path) => `  ${path}`).join('\n');
}

const options = parseArgs(process.argv.slice(2));
const fingerprint = envFingerprint();

assertEnvExhaustive();

const { dirtyPaths, ...commit } = commitInfo();

if (options.release && commit.dirty) {
  fail(
    'a release snapshot must describe a committed tree, and these paths are modified:\n' +
      `${listPaths(dirtyPaths)}\n` +
      'Stash them and run again: git stash push <path>',
  );
}

runBuild();

// Hard stop: the existence of local-only bundled locales will inflate the snapshot
if (BUNDLED_LOCAL.length) {
  fail(
    `git ignores ${BUNDLED_LOCAL.length} locale files under public/, and src/locales/i18n.js globs ` +
      'each one into a precached chunk. Those chunks are build output, so this script cannot ' +
      'filter them, and any snapshot taken now counts files no other checkout has:\n' +
      listPaths(BUNDLED_LOCAL.sort().map((url) => `public${url}`)) +
      '\nDelete them and build again.',
  );
}

if (!existsSync(join(DIST, 'sw.js'))) {
  fail('dist/sw.js is missing, so there is no precache manifest to read');
}

const version = JSON.parse(readFileSync(join(WEBAPP, 'package.json'), 'utf8')).version;
const files = measure(readManifest());

const snapshot = {
  schema: SCHEMA,
  commit,
  version,
  label: options.label,
  gzipLevel: GZIP_LEVEL,
  gzipMinLength: GZIP_MIN_LENGTH,
  node: process.version,
  vite: viteVersion(),
  envFingerprint: fingerprint,
  entry: [...entryUrls()].sort(),
  totals: totals(files),
  files,
};

const directory = options.release ? RELEASE_DIR : LOCAL_DIR;
const name = options.release
  ? `${version}-${commit.shortSha}.json`
  : `${commit.shortSha}${options.label ? `-${options.label}` : ''}.json`;
const outputPath = join(directory, name);

mkdirSync(directory, { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);

console.log(`\nwrote ${relative(WEBAPP, outputPath)}`);
console.log(`  commit     ${commit.shortSha}${commit.dirty ? ' (dirty)' : ''} on ${commit.branch}`);
console.log(`  version    ${version}`);
for (const [label, bucket] of [
  ['precache', snapshot.totals.precached],
  ['not precached', snapshot.totals.onDemand],
]) {
  console.log(
    `  ${label.padEnd(16)}${String(bucket.files).padStart(4)} files, ${mb(bucket.raw)} MB raw, ` +
      `${mb(bucket.transfer)} MB over the network`,
  );
}

if (LOCAL_ONLY.size) {
  console.log(
    `\ngit ignores these ${LOCAL_ONLY.size} files under public/, so they are not measured:`,
  );
  console.log(listPaths([...LOCAL_ONLY].sort().map((url) => `public${url}`)));
}

if (commit.dirty) {
  console.log('\nthis snapshot describes no committed state, because these paths are modified:');
  console.log(listPaths(dirtyPaths));
  console.log('To measure a committed tree, stash them and run again: git stash push <path>');
}
