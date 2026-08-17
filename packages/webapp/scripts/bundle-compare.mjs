#!/usr/bin/env node
//
// Compare two snapshots written by bundle-snapshot.mjs and report what changed.
//
// Usage, output blocks and failure messages: ../bundle-snapshots/README.md

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// 400 kilobits/sec, converted to 50 kilobytes/sec for the time estimate.
const KBPS = 400 / 8;

// Beyond this, the added and removed lists are truncated with an explicit count.
const LIST_LIMIT = 40;

const MOVERS = 15;

// Two snapshots that disagree on any of these were not measured the same way.
const MEASUREMENT_FIELDS = ['schema', 'gzipLevel', 'gzipMinLength'];

const TOOLCHAIN_FIELDS = ['envFingerprint', 'node', 'vite'];

const TOOLCHAIN_WARNINGS = {
  envFingerprint: [
    'The pinned build environment changed between these two snapshots, most likely because a',
    'VITE_ variable was added. Vite inlines those values, so the hash moves on every chunk that',
    'reads one and on every chunk importing it, directly or not.',
  ],
  node: [
    'These snapshots were measured on different Node versions. Node carries its own zlib, so',
    'every compressed size can move without the bundle changing.',
  ],
  vite: [
    'These snapshots were built by different Vite versions. Chunk layout and the hashed filename',
    'format belong to the bundler, so names and sizes can move without the source changing.',
  ],
};

const WEBAPP = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SEARCH_DIRS = [join(WEBAPP, '.bundle-snapshots'), join(WEBAPP, 'bundle-snapshots')];

const log = (text = '') =>
  console.log(
    String(text)
      .split('\n')
      .map((line) => (line ? `  ${line}` : line))
      .join('\n'),
  );

function fail(message) {
  console.error(`bundle-compare: ${message}`);
  process.exit(1);
}

function resolveSnapshot(arg) {
  const candidates = [];
  for (const name of [arg, `${arg}.json`]) {
    candidates.push(isAbsolute(name) ? name : resolve(process.cwd(), name));
    for (const dir of SEARCH_DIRS) {
      candidates.push(join(dir, name));
    }
  }
  const found = candidates.find((path) => existsSync(path));
  if (found) {
    return found;
  }

  const isReleaseSnapshot = (name, arg) =>
    new RegExp(`^${arg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-[0-9a-f]{7,12}\\.json$`).test(name);

  const matches = SEARCH_DIRS.filter((dir) => existsSync(dir)).flatMap((dir) =>
    readdirSync(dir)
      .filter((name) => name.endsWith(`-${arg}.json`) || isReleaseSnapshot(name, arg))
      .map((name) => join(dir, name)),
  );
  if (matches.length === 1) {
    return matches[0];
  }
  if (matches.length > 1) {
    fail(`${arg} matches ${matches.map((path) => basename(path)).join(' and ')}`);
  }
  return fail(`no snapshot found for ${arg}`);
}

function load(arg) {
  const path = resolveSnapshot(arg);
  try {
    return { path, snapshot: JSON.parse(readFileSync(path, 'utf8')) };
  } catch (error) {
    return fail(`${path} is not readable as JSON: ${error.message}`);
  }
}

function checkComparable(older, newer) {
  const mismatched = MEASUREMENT_FIELDS.filter(
    (field) => older.snapshot[field] !== newer.snapshot[field],
  );
  if (mismatched.length) {
    fail(
      `these snapshots differ in ${mismatched.join(
        ', ',
      )}, so they were not measured the same way ` +
        'and cannot be diffed. Re-take the older snapshot with the current script.',
    );
  }
  return TOOLCHAIN_FIELDS.filter((field) => older.snapshot[field] !== newer.snapshot[field]);
}

const mb = (bytes) => (bytes / 1024 ** 2).toFixed(2);
const kb = (bytes) => (bytes / 1024).toFixed(1);
const secs = (bytes) => (bytes / 1024 / KBPS).toFixed(1);
const signedKb = (bytes) => `${bytes >= 0 ? '+' : '-'}${kb(Math.abs(bytes))}`;

function percent(before, after) {
  if (before === 0) {
    return after === 0 ? '0.0%' : 'new';
  }
  const change = ((after - before) / before) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
}

/** Manifest entries by url */
function precachedByUrl(snapshot) {
  const entries = new Map();
  for (const file of snapshot.files) {
    if (file.precached) {
      entries.set(file.url, file);
    }
  }
  return entries;
}

const NO_FILES = { files: 0, raw: 0, gz: 0, transfer: 0 };

function byCategory(files) {
  const totals = new Map();
  for (const file of files) {
    const row = totals.get(file.category) ?? { files: 0, raw: 0, gz: 0, transfer: 0 };
    row.files += 1;
    row.raw += file.raw;
    row.gz += file.gz;
    row.transfer += file.transfer;
    totals.set(file.category, row);
  }
  return totals;
}

function transferByStableName(snapshot) {
  const sizes = new Map();
  for (const file of snapshot.files) {
    sizes.set(file.stableName, (sizes.get(file.stableName) ?? 0) + file.transfer);
  }
  return sizes;
}

/**
 * How many files carry each stable name. Rollup names a chunk after its entry module's basename,
 * and most components and containers are an `index.jsx`. A count above one means the name does
 * not identify which file it belongs to.
 */
function countByStableName(files) {
  const counts = new Map();
  for (const file of files) {
    counts.set(file.stableName, (counts.get(file.stableName) ?? 0) + 1);
  }
  return counts;
}

function printList(title, names) {
  if (!names.length) {
    return;
  }
  log(`\n${title} (${names.length}):`);
  for (const name of names.slice(0, LIST_LIMIT)) {
    log(`  ${name}`);
  }
  if (names.length > LIST_LIMIT) {
    log(`  ... and ${names.length - LIST_LIMIT} more`);
  }
}

const args = process.argv.slice(2).filter((arg) => arg !== '--');
const flags = args.filter((arg) => arg.startsWith('-'));
if (flags.length) {
  fail(`unknown argument ${flags[0]}`);
}
if (args.length !== 2) {
  fail('usage: pnpm bundle-compare <older> <newer>');
}

const older = load(args[0]);
const newer = load(args[1]);
const toolchainChanges = checkComparable(older, newer);

const before = older.snapshot;
const after = newer.snapshot;

function describe(loaded) {
  const { commit, version, label } = loaded.snapshot;
  return (
    `${commit.shortSha}${commit.dirty ? ' (dirty)' : ''} on ${commit.branch}, ` +
    `version ${version}${label ? `, label ${label}` : ''}`
  );
}

log(`older  ${describe(older)}`);
log(`newer  ${describe(newer)}`);

function sizeRow(label, a, b) {
  return (
    `${label.padEnd(18)}${String(b.files).padStart(6)}${`${mb(b.transfer)} MB`.padStart(10)}` +
    `${`${signedKb(b.transfer - a.transfer)} KB`.padStart(12)}` +
    `${percent(a.transfer, b.transfer).padStart(9)}`
  );
}

const SIZE_HEADER =
  `${''.padEnd(18)}${'files'.padStart(6)}${'network'.padStart(10)}` +
  `${'change'.padStart(12)}${'pct'.padStart(9)}`;

log('\n=== FIRST INSTALL ===  every precache entry, fetched before anything works offline');
log(SIZE_HEADER);
log(
  `${sizeRow('precache', before.totals.precached, after.totals.precached)}` +
    `   ${secs(after.totals.precached.transfer)} s at 400 kbps`,
);

log('\n=== NOT PRECACHED ===  fetched only when something asks for it');
log(SIZE_HEADER);
log(sizeRow('total', before.totals.onDemand, after.totals.onDemand));

const notPrecachedBefore = byCategory(before.files.filter((file) => !file.precached));
const notPrecachedAfter = byCategory(after.files.filter((file) => !file.precached));
const notPrecachedKinds = [...new Set([...notPrecachedBefore.keys(), ...notPrecachedAfter.keys()])];
for (const kind of notPrecachedKinds.sort(
  (a, b) => (notPrecachedAfter.get(b)?.transfer ?? 0) - (notPrecachedAfter.get(a)?.transfer ?? 0),
)) {
  log(
    sizeRow(
      `  ${kind}`,
      notPrecachedBefore.get(kind) ?? NO_FILES,
      notPrecachedAfter.get(kind) ?? NO_FILES,
    ),
  );
}

const beforePrecached = precachedByUrl(before);
const afterPrecached = precachedByUrl(after);

const fetched = [...afterPrecached.values()].filter((file) => {
  const previous = beforePrecached.get(file.url);
  // A precache entry counts as fetched when its url is absent from
  // the older snapshot, or for non-hashed tracked files, when `revision` changed
  return !previous || previous.revision !== file.revision;
});
const fetchedSet = new Set(fetched);
const reused = [...afterPrecached.values()].filter((file) => !fetchedSet.has(file));
const removedFromCache = [...beforePrecached.keys()].filter((url) => !afterPrecached.has(url));

const transferOf = (files) => files.reduce((total, file) => total + file.transfer, 0);
const fetchedTransfer = transferOf(fetched);
const installTransfer = after.totals.precached.transfer;

// The entry chunk gets its own row. It is the largest single precache entry, and its hash moves
// whenever any chunk it imports does, because it carries their hashed filenames.
const entryUrls = new Set(after.entry ?? []);
const entryChunk = fetched.filter((file) => entryUrls.has(file.url));
const rest = fetched.filter((file) => !entryUrls.has(file.url));

const beforeStableNames = new Set([...beforePrecached.values()].map((file) => file.stableName));
const afterPrecachedCounts = countByStableName([...afterPrecached.values()]);
const newName = rest.filter((file) => !beforeStableNames.has(file.stableName));
const shared = rest.filter(
  (file) => beforeStableNames.has(file.stableName) && afterPrecachedCounts.get(file.stableName) > 1,
);
const matched = rest.filter(
  (file) =>
    beforeStableNames.has(file.stableName) && afterPrecachedCounts.get(file.stableName) === 1,
);

for (const field of toolchainChanges) {
  log('');
  for (const [index, line] of TOOLCHAIN_WARNINGS[field].entries()) {
    log(`${index === 0 ? '!! ' : '   '}${line}`);
  }
}

function updateRow(label, entries, transfer, note = '') {
  const size = transfer === null ? '' : `${mb(transfer)} MB`.padStart(10);
  return `${label.padEnd(36)}${String(entries).padStart(5)}${size}${note && `   ${note}`}`;
}

const entryLabel = entryChunk.length
  ? `   entry chunk (${entryChunk.map((file) => basename(file.url)).join(', ')})`
  : '   entry chunk';

log('\n=== UPDATE ===  what a user already on the older build fetches');
log(
  `${updateRow('fetched', fetched.length, fetchedTransfer)}` +
    `${`${secs(fetchedTransfer)} s at 400 kbps`.padStart(21)}` +
    `${`${((fetchedTransfer / installTransfer) * 100).toFixed(1)}% of a first install`.padStart(
      27,
    )}`,
);
log(updateRow(entryLabel, entryChunk.length, transferOf(entryChunk)));
log(updateRow('   name older build already had', matched.length, transferOf(matched)));
log(updateRow('   name shared by many files', shared.length, transferOf(shared)));
log(updateRow('   name new to this build', newName.length, transferOf(newName)));
log(updateRow('reused from cache', reused.length, transferOf(reused)));
log(updateRow('removed from cache', removedFromCache.length, null));

const fetchedByKind = byCategory(fetched);
const reusedByKind = byCategory(reused);
const kinds = [...new Set([...fetchedByKind.keys(), ...reusedByKind.keys()])];

log(`\n${'by kind'.padEnd(20)}${'fetched'.padStart(19)}${'reused'.padStart(19)}`);
log(
  `${''.padEnd(20)}${'files'.padStart(7)}${'network'.padStart(12)}` +
    `${'files'.padStart(7)}${'network'.padStart(12)}`,
);
for (const kind of kinds.sort(
  (a, b) => (fetchedByKind.get(b)?.transfer ?? 0) - (fetchedByKind.get(a)?.transfer ?? 0),
)) {
  const wasFetched = fetchedByKind.get(kind) ?? NO_FILES;
  const wasReused = reusedByKind.get(kind) ?? NO_FILES;
  log(
    `${kind.padEnd(20)}${String(wasFetched.files).padStart(7)}${`${kb(
      wasFetched.transfer,
    )} KB`.padStart(12)}` +
      `${String(wasReused.files).padStart(7)}${`${kb(wasReused.transfer)} KB`.padStart(12)}`,
  );
}

const beforeSizes = transferByStableName(before);
const afterSizes = transferByStableName(after);
const beforeCounts = countByStableName(before.files);
const afterCounts = countByStableName(after.files);
const allNames = new Set([...beforeSizes.keys(), ...afterSizes.keys()]);

function fileCountNote(name) {
  const count = Math.max(beforeCounts.get(name) ?? 0, afterCounts.get(name) ?? 0);
  return count > 1 ? `  (${count} files)` : '';
}

const movers = [];
const added = [];
const removed = [];
for (const name of allNames) {
  const a = beforeSizes.get(name) ?? 0;
  const b = afterSizes.get(name) ?? 0;
  if (a === 0) {
    added.push(name);
  } else if (b === 0) {
    removed.push(name);
  }
  if (a !== b) {
    movers.push({ name, before: a, after: b, delta: b - a });
  }
}
movers.sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));

log(`\n=== BIGGEST MOVERS (network bytes, by stable name, ${movers.length} changed) ===`);
if (!movers.length) {
  log('none — no file changed size');
}
for (const mover of movers.slice(0, MOVERS)) {
  log(
    `${signedKb(mover.delta).padStart(10)} KB  ${kb(mover.before).padStart(9)} -> ` +
      `${kb(mover.after).padStart(9)} KB  ${mover.name}${fileCountNote(mover.name)}`,
  );
}

printList('added', added.sort());
printList('removed', removed.sort());
