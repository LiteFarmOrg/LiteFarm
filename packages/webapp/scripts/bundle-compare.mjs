#!/usr/bin/env node
//
// Compare two snapshots written by bundle-snapshot.mjs and report what changed.
//
// Usage, output blocks and failure messages: ../bundle-snapshots/README.md
//
// A precache entry counts as fetched on update when its url is absent from the older snapshot, and
// also when the url matches but `revision` changed — index.html and the other entries Workbox
// tracks by revision keep their url across builds.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// 400 kbps, the baseline network the performance work is measured against, as KB per second.
const KBPS = 400 / 8;

// Beyond this, the added and removed lists are truncated with an explicit count.
const LIST_LIMIT = 40;

const MOVERS = 15;

const WEBAPP = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SEARCH_DIRS = [join(WEBAPP, '.bundle-snapshots'), join(WEBAPP, 'bundle-snapshots')];

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

  // A bare label or short SHA, matching the tail of `<shortSha>-<label>.json`.
  const matches = SEARCH_DIRS.filter((dir) => existsSync(dir)).flatMap((dir) =>
    readdirSync(dir)
      .filter((name) => name.endsWith(`-${arg}.json`))
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

/**
 * A snapshot pair whose measurement differs cannot be diffed at all. A pair whose build environment
 * differs can: the diff is real, and the environment change is one of the things it is measuring.
 */
function checkComparable(older, newer) {
  const mismatched = ['schema', 'source', 'gzipLevel'].filter(
    (field) => older.snapshot[field] !== newer.snapshot[field],
  );
  if (mismatched.length) {
    fail(
      `these snapshots differ in ${mismatched.join(', ')}, so they were not measured the same way ` +
        'and cannot be diffed. Re-take the older snapshot with the current script.',
    );
  }
  return older.snapshot.envFingerprint !== newer.snapshot.envFingerprint;
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

/** Manifest entries by url. The value is what decides whether the entry is fetched again. */
function precachedByUrl(snapshot) {
  const entries = new Map();
  for (const file of snapshot.files) {
    if (file.precached) {
      entries.set(file.url, file);
    }
  }
  return entries;
}

const NO_FILES = { files: 0, raw: 0, gz: 0 };

/** File count and bytes per category, for one set of files. */
function byCategory(files) {
  const totals = new Map();
  for (const file of files) {
    const row = totals.get(file.category) ?? { files: 0, raw: 0, gz: 0 };
    row.files += 1;
    row.raw += file.raw;
    row.gz += file.gz;
    totals.set(file.category, row);
  }
  return totals;
}

/** Gzipped bytes per stable name, so the same file rebuilt under a new hash lines up. */
function gzByStableName(snapshot) {
  const sizes = new Map();
  for (const file of snapshot.files) {
    sizes.set(file.stableName, (sizes.get(file.stableName) ?? 0) + file.gz);
  }
  return sizes;
}

/**
 * How many files carry each stable name. Rollup names a chunk after its entry module's basename,
 * and most components and containers are an `index.jsx`, so a count above one means the name does
 * not identify which file it belongs to.
 */
function countByStableName(snapshot) {
  const counts = new Map();
  for (const file of snapshot.files) {
    counts.set(file.stableName, (counts.get(file.stableName) ?? 0) + 1);
  }
  return counts;
}

function printList(title, names) {
  if (!names.length) {
    return;
  }
  console.log(`\n${title} (${names.length}):`);
  for (const name of names.slice(0, LIST_LIMIT)) {
    console.log(`  ${name}`);
  }
  if (names.length > LIST_LIMIT) {
    console.log(`  ... and ${names.length - LIST_LIMIT} more`);
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
const envChanged = checkComparable(older, newer);

const before = older.snapshot;
const after = newer.snapshot;

function describe(loaded) {
  const { commit, version, label } = loaded.snapshot;
  return (
    `${commit.shortSha}${commit.dirty ? ' (dirty)' : ''} on ${commit.branch}, ` +
    `version ${version}${label ? `, label ${label}` : ''}`
  );
}

console.log(`older  ${describe(older)}`);
console.log(`newer  ${describe(newer)}`);

/** One `label / files / gz / change / pct` line, for either bucket. */
function sizeRow(label, a, b) {
  return (
    `${label.padEnd(18)}${String(b.files).padStart(6)}${`${mb(b.gz)} MB`.padStart(10)}` +
    `${`${signedKb(b.gz - a.gz)} KB`.padStart(12)}${percent(a.gz, b.gz).padStart(9)}`
  );
}

const SIZE_HEADER =
  `${''.padEnd(18)}${'files'.padStart(6)}${'gz'.padStart(10)}` +
  `${'change'.padStart(12)}${'pct'.padStart(9)}`;

console.log('\n=== FIRST INSTALL ===  every precache entry, fetched before anything works offline');
console.log(`${SIZE_HEADER}${'at 400 kbps'.padStart(14)}`);
console.log(
  `${sizeRow('precache', before.totals.precached, after.totals.precached)}` +
    `${`${secs(after.totals.precached.gz)} s`.padStart(14)}`,
);

console.log('\n=== NOT PRECACHED ===  fetched only when something asks for it');
console.log(SIZE_HEADER);
console.log(sizeRow('total', before.totals.onDemand, after.totals.onDemand));

const notPrecachedBefore = byCategory(before.files.filter((file) => !file.precached));
const notPrecachedAfter = byCategory(after.files.filter((file) => !file.precached));
const notPrecachedKinds = [...new Set([...notPrecachedBefore.keys(), ...notPrecachedAfter.keys()])];
for (const kind of notPrecachedKinds.sort(
  (a, b) => (notPrecachedAfter.get(b)?.gz ?? 0) - (notPrecachedAfter.get(a)?.gz ?? 0),
)) {
  console.log(
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
  return !previous || previous.revision !== file.revision;
});
const fetchedSet = new Set(fetched);
const reused = [...afterPrecached.values()].filter((file) => !fetchedSet.has(file));
const removedFromCache = [...beforePrecached.keys()].filter((url) => !afterPrecached.has(url));

const gzOf = (files) => files.reduce((total, file) => total + file.gz, 0);
const fetchedGz = gzOf(fetched);
const installGz = after.totals.precached.gz;

const beforeStableNames = new Set([...beforePrecached.values()].map((file) => file.stableName));
const afterNameCounts = countByStableName(after);
const newName = fetched.filter((file) => !beforeStableNames.has(file.stableName));
const shared = fetched.filter(
  (file) => beforeStableNames.has(file.stableName) && afterNameCounts.get(file.stableName) > 1,
);
const matched = fetched.filter(
  (file) => beforeStableNames.has(file.stableName) && afterNameCounts.get(file.stableName) === 1,
);

/** The stable names carrying the most fetched bytes, so the shared-name row names its own cause. */
function topNames(files, limit) {
  const gzPerName = new Map();
  for (const file of files) {
    gzPerName.set(file.stableName, (gzPerName.get(file.stableName) ?? 0) + file.gz);
  }
  const sorted = [...gzPerName].sort((a, b) => b[1] - a[1]);
  const names = sorted.slice(0, limit).map(([name]) => name);
  return sorted.length > limit ? [...names, `and ${sorted.length - limit} more`] : names;
}

if (envChanged) {
  console.log('\n!! The pinned build environment changed between these two snapshots, most likely');
  console.log('   because a VITE_ variable was added. Vite inlines those values, so the hash moves');
  console.log('   on every chunk that reads one and on every chunk importing it, directly or not.');
  console.log('   Part of the update below is that move rather than new code, and it is still a');
  console.log('   cost every returning visitor pays once.');
}

/** One `label / entries / gz` line under UPDATE, with an optional trailing note. */
function updateRow(label, entries, gz, note = '') {
  const size = gz === null ? '' : `${mb(gz)} MB`.padStart(10);
  return `${label.padEnd(38)}${String(entries).padStart(5)}${size}${note && `   ${note}`}`;
}

console.log('\n=== UPDATE ===  what a user already on the older build fetches');
console.log(
  `${updateRow('fetched', fetched.length, fetchedGz)}` +
    `${`${secs(fetchedGz)} s at 400 kbps`.padStart(21)}` +
    `${`${((fetchedGz / installGz) * 100).toFixed(1)}% of a first install`.padStart(27)}`,
);
console.log(updateRow('   a name the older build already had', matched.length, gzOf(matched)));
console.log(
  updateRow('   a name shared by many files', shared.length, gzOf(shared), topNames(shared, 2).join(', ')),
);
console.log(updateRow('   a name new to this build', newName.length, gzOf(newName)));
console.log(updateRow('reused from cache', reused.length, gzOf(reused)));
console.log(updateRow('removed from cache', removedFromCache.length, null));

const fetchedByKind = byCategory(fetched);
const reusedByKind = byCategory(reused);
const kinds = [...new Set([...fetchedByKind.keys(), ...reusedByKind.keys()])];

console.log(`\n${'by kind'.padEnd(20)}${'fetched'.padStart(19)}${'reused'.padStart(19)}`);
console.log(
  `${''.padEnd(20)}${'files'.padStart(7)}${'gz'.padStart(12)}` +
    `${'files'.padStart(7)}${'gz'.padStart(12)}`,
);
for (const kind of kinds.sort(
  (a, b) => (fetchedByKind.get(b)?.gz ?? 0) - (fetchedByKind.get(a)?.gz ?? 0),
)) {
  const wasFetched = fetchedByKind.get(kind) ?? NO_FILES;
  const wasReused = reusedByKind.get(kind) ?? NO_FILES;
  console.log(
    `${kind.padEnd(20)}${String(wasFetched.files).padStart(7)}${`${kb(wasFetched.gz)} KB`.padStart(12)}` +
      `${String(wasReused.files).padStart(7)}${`${kb(wasReused.gz)} KB`.padStart(12)}`,
  );
}

const beforeSizes = gzByStableName(before);
const afterSizes = gzByStableName(after);
const beforeCounts = countByStableName(before);
const allNames = new Set([...beforeSizes.keys(), ...afterSizes.keys()]);

/** A name covering more than one file is a sum, so the row prints how many files it covers. */
function fileCountNote(name) {
  const count = Math.max(beforeCounts.get(name) ?? 0, afterNameCounts.get(name) ?? 0);
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

console.log(`\n=== BIGGEST MOVERS (gzipped, by stable name, ${movers.length} changed) ===`);
if (!movers.length) {
  console.log('none — no file changed size');
}
for (const mover of movers.slice(0, MOVERS)) {
  console.log(
    `${signedKb(mover.delta).padStart(10)} KB  ${kb(mover.before).padStart(9)} -> ` +
      `${kb(mover.after).padStart(9)} KB  ${mover.name}${fileCountNote(mover.name)}`,
  );
}

printList('added', added.sort());
printList('removed', removed.sort());
