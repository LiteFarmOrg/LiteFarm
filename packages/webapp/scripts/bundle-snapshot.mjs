#!/usr/bin/env node
//
// Measure one build of the webapp and write one JSON snapshot.
//
// Usage, output fields and failure messages: ../bundle-snapshots/README.md
//
// The script runs the build itself. Eleven files under `src/` read `import.meta.env`, and Vite
// inlines each value at build time, so the environment the build ran under is part of what the
// snapshot describes. `envFingerprint` records it; snapshots taken under different values are not
// comparable.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const SCHEMA = 1;

// Matches `gzip_comp_level` in packages/webapp/nginx.conf.
const GZIP_LEVEL = 6;

// Asserted to appear in the built output on every run. If it does not, the environment override
// below did not take effect and the snapshot describes an unknown environment.
const SENTINEL_API_URL = 'https://snapshot.invalid';

// Keys a deployed build has a value for. All values here are dummies; none is secret. `NODE_ENV` is
// set because Vite otherwise takes it from the developer's `.env`, where `development` yields a
// React development build.
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

// Keys only a local `.env` carries, blanked because an unset key falls back to that file.
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
const BUILD_MARKER = join(LOCAL_DIR, '.last-build.json');

const PUBLIC = join(WEBAPP, 'public');

// `public/` is copied into `dist` wholesale, so a file git ignores there is measured on the machine
// that has it and absent from every deployed build. Git is the authority on which those are.
// macOS recreates `.DS_Store` as soon as a folder is opened, so deleting it does not stay done. No
// server serves it and no glob matches it, which is what makes it safe to drop rather than report.
const REGENERATED = new Set(['.DS_Store']);

const LOCAL_ONLY = ignoredUnderPublic();

// The one glob that reaches public/ is `public/locales/{lng}/*.json` in `src/locales/i18n.js`. An
// ignored file it matches becomes a chunk in dist, which is build output no filter here can catch.
const BUNDLED_LOCAL = [...LOCAL_ONLY].filter((url) => /^\/locales\/[^/]+\/[^/]+\.json$/.test(url));

// One chunk per namespace per language, from the `import.meta.glob` over `public/locales` in
// `src/locales/i18n.js`. The namespaces are whatever is on disk.
const LOCALE_NAMESPACES = new Set(
  readdirSync(join(PUBLIC, 'locales', 'en'))
    .filter((name) => name.endsWith('.json'))
    .filter((name) => !LOCAL_ONLY.has(`/locales/en/${name}`))
    .map((name) => name.slice(0, -'.json'.length)),
);

// The `-<hash>` Rollup inserts before the extension. Matches both Rollup 3's `crop-0de75771.js`
// and Rollup 4's `index-BfFsbPPC.js`.
const HASH_PATTERN = /-([A-Za-z0-9_-]{8})(?=\.[^/]*$)/;

const IMAGE_PATTERN = /\.(avif|gif|ico|jpe?g|png|webp)$/;
const FONT_PATTERN = /\.(eot|otf|ttf|woff2?)$/;

// The path `src/locales/i18n.js` gives HttpBackend as `loadPath`, one file per namespace per
// language, served over the network rather than compiled into a chunk.
const TRANSLATION_JSON_PATTERN = /^\/locales\/.+\.json$/;

function fail(message) {
  console.error(`bundle-snapshot: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const options = { build: true, release: false, label: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--release') {
      options.release = true;
    } else if (arg === '--no-build') {
      options.build = false;
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
  return result.stdout.trim();
}

/** Working-tree state, ignoring vite.config.ts, which carries local dev config on some machines. */
function commitInfo() {
  const status = git(['status', '--porcelain']);
  const dirty = status
    .split('\n')
    .filter(Boolean)
    .some((line) => line.slice(3).trim() !== 'packages/webapp/vite.config.ts');
  return {
    sha: git(['rev-parse', 'HEAD']),
    shortSha: git(['rev-parse', '--short', 'HEAD']),
    branch: git(['rev-parse', '--abbrev-ref', 'HEAD']),
    dirty,
  };
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
 * The `public/` files git ignores, as the urls they take in `dist`. `git check-ignore` exits 1 when
 * nothing matches, which is not an error.
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
  if (result.status > 1) {
    fail(`git check-ignore failed: ${(result.stderr || '').trim()}`);
  }
  return new Set(
    result.stdout
      .split('\n')
      .filter(Boolean)
      .map((path) => normaliseUrl(relative(PUBLIC, path))),
  );
}

/** Every `import.meta.env.VITE_*` key read under src/ must be given a value or blanked. */
function assertEnvExhaustive() {
  const used = new Set();
  for (const path of walk(SRC)) {
    if (!/\.(js|jsx|ts|tsx)$/.test(path)) {
      continue;
    }
    for (const match of readFileSync(path, 'utf8').matchAll(/import\.meta\.env\.(VITE_[A-Z0-9_]+)/g)) {
      used.add(match[1]);
    }
  }
  const unaccounted = [...used]
    .filter((key) => !(key in PINNED_ENV) && !(key in BLANKED_ENV))
    .sort();
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

function runBuild(fingerprint) {
  console.log('bundle-snapshot: building with the pinned environment (this takes minutes)');
  const result = spawnSync('pnpm', ['build'], {
    cwd: WEBAPP,
    stdio: 'inherit',
    env: { ...process.env, ...PINNED_ENV, ...BLANKED_ENV },
  });
  if (result.status !== 0) {
    fail('the build failed');
  }
  mkdirSync(LOCAL_DIR, { recursive: true });
  writeFileSync(BUILD_MARKER, `${JSON.stringify({ envFingerprint: fingerprint }, null, 2)}\n`);
}

/** The dist on disk must be one this script built, under the pin now in force. */
function assertBuiltByThisScript(fingerprint) {
  if (!existsSync(BUILD_MARKER)) {
    fail('--no-build, but no dist built by this script. Run without --no-build.');
  }
  const marker = JSON.parse(readFileSync(BUILD_MARKER, 'utf8'));
  if (marker.envFingerprint !== fingerprint) {
    fail(
      '--no-build, but the existing dist was built under a different pinned environment. ' +
        'Run without --no-build.',
    );
  }
}

/** Precache manifest URLs, and their revisions, out of a built sw.js. */
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

function splitHash(url) {
  const match = url.match(HASH_PATTERN);
  return {
    hash: match ? match[1] : null,
    stableName: match ? url.replace(HASH_PATTERN, '') : url,
  };
}

function categorise(url, stableName) {
  const ext = extname(url);
  if (ext === '.map') {
    return 'sourcemap';
  }
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

function measure(manifest) {
  const files = [];
  let sentinelSeen = false;

  for (const path of walk(DIST)) {
    const url = normaliseUrl(relative(DIST, path));
    if (LOCAL_ONLY.has(url)) {
      continue;
    }
    const { hash, stableName } = splitHash(url);
    const category = categorise(url, stableName);
    const bytes = readFileSync(path);

    if (category !== 'sourcemap' && bytes.includes(SENTINEL_API_URL)) {
      sentinelSeen = true;
    }
    if (url.startsWith('/assets/') && stableName === url) {
      fail(
        `${url} is under /assets/ but carries no recognised content hash. ` +
          'The hash pattern in this file misses the current filename format.',
      );
    }

    files.push({
      url,
      stableName,
      hash,
      raw: bytes.length,
      gz: gzipSync(bytes, { level: GZIP_LEVEL }).length,
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
    (acc, file) => ({ files: acc.files + 1, raw: acc.raw + file.raw, gz: acc.gz + file.gz }),
    { files: 0, raw: 0, gz: 0 },
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

const options = parseArgs(process.argv.slice(2));
const fingerprint = envFingerprint();

assertEnvExhaustive();

if (options.build) {
  runBuild(fingerprint);
} else {
  assertBuiltByThisScript(fingerprint);
}

// Every comparison this snapshot takes part in is wrong while these exist, not only a committed
// one: each file becomes a precached chunk that the other side of the diff reports as new.
if (BUNDLED_LOCAL.length) {
  fail(
    `git ignores ${BUNDLED_LOCAL.length} locale files under public/, and src/locales/i18n.js globs ` +
      'each one into a precached chunk. Those chunks are build output, so this script cannot ' +
      'filter them, and any snapshot taken now counts files no other checkout has:\n' +
      BUNDLED_LOCAL.sort()
        .map((url) => `  public${url}`)
        .join('\n') +
      '\nDelete them and build again.',
  );
}

if (!existsSync(join(DIST, 'sw.js'))) {
  fail('dist/sw.js is missing, so there is no precache manifest to read');
}

const commit = commitInfo();
const version = JSON.parse(readFileSync(join(WEBAPP, 'package.json'), 'utf8')).version;
// No user downloads a sourcemap: a browser requests one only when DevTools is open, and they are
// not in the precache manifest.
const files = measure(readManifest()).filter((file) => file.category !== 'sourcemap');

const snapshot = {
  schema: SCHEMA,
  source: 'dist',
  commit,
  version,
  label: options.label,
  gzipLevel: GZIP_LEVEL,
  node: process.version,
  envFingerprint: fingerprint,
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

const { precached, onDemand } = snapshot.totals;
console.log(`\nwrote ${relative(WEBAPP, outputPath)}`);
console.log(`  commit     ${commit.shortSha}${commit.dirty ? ' (dirty)' : ''} on ${commit.branch}`);
console.log(`  version    ${version}`);
console.log(
  `  precache       ${precached.files} files, ${mb(precached.raw)} MB raw, ${mb(precached.gz)} MB gz`,
);
console.log(
  `  not precached  ${onDemand.files} files, ${mb(onDemand.raw)} MB raw, ${mb(onDemand.gz)} MB gz`,
);

if (LOCAL_ONLY.size) {
  console.log(`\ngit ignores these ${LOCAL_ONLY.size} files under public/, so they are not measured:`);
  for (const url of [...LOCAL_ONLY].sort()) {
    console.log(`  public${url}`);
  }
}
if (BUNDLED_LOCAL.length) {
  console.log(
    `\n${BUNDLED_LOCAL.length} of them are locale JSON, which src/locales/i18n.js globs into\n` +
      'precached chunks. Those chunks are build output, so no filter here removes them. Delete the\n' +
      'files above and rebuild for a snapshot another checkout reproduces.',
  );
}

if (commit.dirty) {
  console.log('\nthe working tree is dirty, so this snapshot describes no committed state');
}
