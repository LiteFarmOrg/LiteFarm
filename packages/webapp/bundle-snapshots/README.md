# Bundle snapshots

> Measure what a build of the webapp costs a user to download, and compare two builds.

Two scripts do this, and they are used together:

- **`pnpm bundle-snapshot`** builds the webapp and writes a JSON file describing the result: every
  file in `dist` with its raw and gzipped size, its content hash, and whether the Workbox precache
  manifest lists it.
- **`pnpm bundle-compare`** reads two of those files and reports what changed, including what a user
  already on the older build has to fetch to reach the newer one.

This page covers how to:

- [Understand what a snapshot measures](#what-a-snapshot-measures) before reading any number
- [Take a snapshot](#taking-a-snapshot) of the current tree or of a release
- [Compare two snapshots](#comparing-two-snapshots) and read the four output blocks
- [Read a snapshot file](#reading-a-snapshot-file) directly
- [Recover](#when-a-run-fails) when a run refuses to finish

## What a snapshot measures

Every measured file is in exactly one of two buckets, decided by whether the Workbox precache
manifest lists it.

| Bucket            | Covers                                                                                                     | Examples                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **precache**      | The manifest lists it, so the service worker fetches it at install, whether or not the user ever needs it. | Route chunks, the framework vendor chunk, CSS, SVG components, locale chunks, `index.html` |
| **not precached** | The manifest does not list it, so it is fetched only when something asks for it.                           | Crop images, the `public/locales` JSON, fonts, the survey vendor chunk, `sw.js`            |

The precache total is what a first visit costs. The other total is the size of everything that could
be requested: most of it is crop images, of which one session fetches a handful, so no user receives
that number.

Sourcemaps are not measured. A browser requests a `.map` only when DevTools is open, and they are
not in the precache manifest.

Files that git ignores under `public/` are not measured either. Vite copies `public/` into `dist`
wholesale, so a `.DS_Store` or a scratch file is in the build on the machine that has it and in no
deployed build. `git check-ignore` decides which those are.

Each file also carries a category, which says what kind of file it is rather than which bucket it is
in. A vendor chunk can be in either.

| Category                      | Covers                                                                                                                                                   |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `js chunk`                    | Any chunk Rollup emitted that is not one of the three below.                                                                                             |
| `framework-vendor`            | `react`, `react-dom` and `scheduler`, grouped by `manualChunks` in `vite.config.ts`.                                                                     |
| `survey-vendor`               | `survey-core` and `survey-react-ui`. `globIgnores` keeps it out of the precache, and the `dynamic-chunks` route in `src/sw.js` caches it on first fetch. |
| `locale chunk`                | One chunk per namespace per language, from the `import.meta.glob` over `public/locales` in `src/locales/i18n.js`.                                        |
| `translation json`            | `public/locales/<lng>/<ns>.json`, which i18next requests over HTTP.                                                                                      |
| `css`, `svg`, `image`, `font` | Decided by extension.                                                                                                                                    |
| `service worker`              | `dist/sw.js`.                                                                                                                                            |
| `other static`                | The remainder: `index.html` and the web app manifests.                                                                                                   |

> [!NOTE]
> Every translation ships twice. The `locale chunk` files are compiled into the bundle and
> precached, so a language works offline; the `translation json` files are served over HTTP for the
> active language. The two sets carry the same strings and land in different buckets.

Locale chunks are recognised by reading the namespaces out of `public/locales/en`, the same
directory `src/locales/i18n.js` globs, so adding a namespace needs no change here.

## Taking a snapshot

```bash
# measure the current tree
pnpm bundle-snapshot

# measure it under a name you will recognise later
pnpm bundle-snapshot --label vite5

# measure a release, into this tracked directory
pnpm bundle-snapshot --release

# re-measure without rebuilding
pnpm bundle-snapshot --no-build
```

The script runs `pnpm build` itself. A build takes minutes. Each run prints where it wrote, the
commit and version it describes, and the two bucket totals.

| Flag             | Effect                                                                                                                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| _(none)_         | Builds, then writes `<shortSha>.json` to the gitignored `.bundle-snapshots/`.                                                                                                                        |
| `--label <name>` | Adds the label to the filename, `<shortSha>-<name>.json`, and records it in the snapshot. The name must be filename-safe: it starts with a letter or a digit, and the rest may add `.`, `_` and `-`. |
| `--release`      | Writes `<version>-<shortSha>.json` to this directory, which is tracked.                                                                                                                              |
| `--no-build`     | Measures the `dist` already on disk. Accepts only a `dist` this script produced under the environment currently pinned, and fails on any other.                                                      |

### Measure a branch against integration

1. Check out `integration` and pull.
2. Run `pnpm bundle-snapshot --label integration`. The build takes several minutes.
3. Check out the branch under test.
4. Run `pnpm bundle-snapshot --label <branch-name>`.
5. Diff them, older first — see [Comparing two snapshots](#comparing-two-snapshots).

Both files stay in `.bundle-snapshots/`, which is gitignored.

### Take a release snapshot

1. Check out the commit being released.
2. Run `git status`. Only `vite.config.ts` may be modified — the run ignores that one file, and
   reports every other change as a dirty tree.
3. Run `pnpm bundle-snapshot --release`.
4. Check that the printed filename carries the version and short SHA you expect, then `git add` it.

> [!WARNING]
> A snapshot taken on a dirty tree carries `dirty: true` and describes no committed state, so it
> cannot serve as a release baseline. The run still writes the file.

> [!TIP]
> For the tree a release actually shipped, check out its tag rather than the version-bump branch.
> Commits land between the two.

### The build environment is pinned

Vite inlines `import.meta.env` values at build time, so the script sets its own fixed values in the
build's environment, where Vite gives them priority over every `.env` file. Two consequences for you:

- **Your `.env` does not affect the result.**
- **JS content hashes belong to those fixed values, not to production's.** `apiConfig.js` and
  `util/constants.js` read those values and are imported across the app, and a changed hash renames
  every chunk that imports one. CSS, SVG and locale chunks are untouched.

## Comparing two snapshots

```bash
# older snapshot first
pnpm bundle-compare <older> <newer>
```

Each argument is a path to a snapshot, a filename looked up in `.bundle-snapshots/` and then in this
directory, or a bare `--label` value. All three of these work:

```bash
pnpm bundle-compare .bundle-snapshots/a1b2c3d-integration.json .bundle-snapshots/e4f5g6h-mybranch.json
pnpm bundle-compare a1b2c3d-integration e4f5g6h-mybranch
pnpm bundle-compare integration mybranch
```

A label has to pick out one file. Two snapshots labelled the same, taken on different commits, fail
the run and are listed by name.

The script refuses to run when the two snapshots differ in `schema`, `source` or `gzipLevel`, since
those mean the two files were not measured the same way. When they disagree on `envFingerprint` it
prints a warning and continues, because part of what it is about to report is hashes moving rather
than new code.

### Reading the output

`UPDATE` and `BIGGEST MOVERS` group files by filename with the content hash removed, so
`/assets/index-BfFsbPPC.js` counts under `/assets/index.js`. Several files can share one such name.

| Block            | What it tells you                                                                                                                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FIRST INSTALL`  | The precache bucket: file count, gzipped size, the change in KB and percent, and the seconds it takes at 400 kbps. This is what a new user pays.                                                                  |
| `NOT PRECACHED`  | The other bucket, as a total and then per category.                                                                                                                                                               |
| `UPDATE`         | What a user already on the older build fetches, in entries, MB, seconds at 400 kbps, and as a share of a first install. Then `reused from cache`, and `removed from cache` for entries Workbox deletes.           |
| `BIGGEST MOVERS` | The fifteen largest gzipped changes by name, each with its file count when the name covers more than one, then every added and removed name. A list longer than forty entries ends with a count of the remainder. |

The indented lines under `fetched` divide it, and every fetched entry is in exactly one of them.

| Row                                  | Means                                                                                                                                    |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `the entry chunk`                    | The chunk `index.html` loads as a module, taken from the `entry` field rather than from a name. Shown only when the entry was fetched.   |
| `a name the older build already had` | One file in this build carries that name, and the older build had it too. This is the only row where a file can be traced across builds. |
| `a name shared by many files`        | Several files in this build carry that name, so no file can be traced. The row names the largest such names.                             |
| `a name new to this build`           | The older build had no file by that name.                                                                                                |

On a routine release the shared row holds most of the bytes. The first row does not mean the bytes
are unchanged: a chunk keeps its name when its source changes.

## Reading a snapshot file

You normally do not have to. `bundle-compare` reads both files and reports the numbers; open the JSON
when you need a figure it does not print, such as the size of one named chunk.

| Field            | Meaning                                                      |
| ---------------- | ------------------------------------------------------------ |
| `schema`         | Snapshot format version.                                     |
| `source`         | `"dist"`. Snapshots from different sources are not compared. |
| `commit`         | `sha`, `shortSha`, `branch`, `dirty`.                        |
| `version`        | From `packages/webapp/package.json`.                         |
| `label`          | The `--label` value, or `null`.                              |
| `gzipLevel`      | `6`, matching `gzip_comp_level` in `nginx.conf`.             |
| `node`           | The Node version that measured the build.                    |
| `envFingerprint` | SHA-256 of the pinned environment.                           |
| `entry`          | The urls `index.html` loads as a module.                     |
| `totals`         | `precached` and `onDemand`, the two buckets above.           |
| `files`          | One entry per measured file, sorted by `url`.                |

Each entry in `files`:

| Field        | Meaning                                                                                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`        | Path inside `dist`, with a leading slash.                                                                                                                         |
| `stableName` | `url` with the content hash removed, so `/assets/index-BfFsbPPC.js` becomes `/assets/index.js`. Several files can share one, so it groups rather than identifies. |
| `hash`       | The content hash, or `null` for a file Vite does not hash.                                                                                                        |
| `raw`        | Decompressed bytes. What Cache Storage holds, because it stores decompressed bodies.                                                                              |
| `gz`         | Transfer bytes at gzip level 6. What crosses the network, and what a metered user pays.                                                                           |
| `category`   | One of the categories above.                                                                                                                                      |
| `precached`  | Whether the precache manifest lists this file.                                                                                                                    |
| `revision`   | Workbox's cache key, for a manifest entry that carries no content hash. `null` otherwise.                                                                         |

Snapshots hold no timestamps and no absolute paths, and `files` is sorted, so two builds of an
unchanged tree produce byte-identical JSON and a committed snapshot diffs readably in a PR.

## Committed snapshots

Only the files in this directory are tracked, named `<version>-<shortSha>.json`. Everything written
without `--release` goes to the gitignored `.bundle-snapshots/`.

An update figure is only real against a build clients actually hold, which means a release. Any two
snapshots can be compared for size, released or not.

Local snapshots have no retention rule.

> [!TIP]
> For a figure you need after the JSON is gone, record it on the relevant Jira ticket.

## When a run fails

Every message is prefixed with the script's name. Nothing is written when a run fails.

| Message                                                                                           | Cause                                                                                                                                                                                                                      | What to do                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/ reads <keys>, which the pinned environment does not account for`                            | A file under `src/` reads an `import.meta.env.VITE_*` key the script does not know about, so the build would take that value from whatever `.env` you have.                                                                | In `scripts/bundle-snapshot.mjs`, add the key to `PINNED_ENV` with a dummy value if a deployed build sets it, or to `BLANKED_ENV` if only a local `.env` carries it. |
| `https://snapshot.invalid does not appear in the built output`                                    | The pinned environment did not reach Vite, so the build ran under an environment the snapshot cannot name. Checked on every run.                                                                                           | Check that `pnpm build` still passes the process environment through to Vite.                                                                                        |
| `<url> is under /assets/ but carries no recognised content hash`                                  | The hash pattern matches neither the Rollup 3 form, eight lowercase hex as in `crop-0de75771.js`, nor the Rollup 4 form, eight mixed-case base64url as in `index-BfFsbPPC.js`. A build tool upgrade can introduce a third. | Update `HASH_PATTERN` in `scripts/bundle-snapshot.mjs`. Until it matches, `stableName` is wrong on every entry.                                                      |
| `--no-build, but no dist built by this script`                                                    | No `dist` produced by this script is on disk.                                                                                                                                                                              | Run without `--no-build`.                                                                                                                                            |
| `--no-build, but the existing dist was built under a different pinned environment`                | `PINNED_ENV` changed since that `dist` was produced.                                                                                                                                                                       | Run without `--no-build`.                                                                                                                                            |
| `dist/sw.js is missing, so there is no precache manifest to read`                                 | The build produced no service worker, so precached files cannot be separated from the rest.                                                                                                                                | Run without `--no-build`.                                                                                                                                            |
| `dist/index.html is missing, so the entry chunks cannot be identified`                            | The build produced no HTML entry point.                                                                                                                                                                                    | Run without `--no-build`.                                                                                                                                            |
| `no module script tag in dist/index.html carries a src, so the entry chunks cannot be identified` | Vite emitted the entry script in a shape the pattern in `entryUrls()` does not match, most likely after a Vite upgrade.                                                                                                    | Update that pattern in `scripts/bundle-snapshot.mjs`.                                                                                                                |
| `the precache manifest in dist/sw.js is empty or could not be parsed`                             | Workbox emitted the manifest in a shape the pattern in `readManifest()` does not match, most likely after a Workbox upgrade.                                                                                               | Update that pattern in `scripts/bundle-snapshot.mjs`.                                                                                                                |
| `the precache manifest lists files that are not in dist`                                          | The manifest and the directory disagree, usually a stale `dist` left by an interrupted build.                                                                                                                              | Delete `packages/webapp/dist`, then run without `--no-build`.                                                                                                        |
| `no snapshot found for <name>`                                                                    | No path, filename or label matches, in the working directory or in either snapshot directory.                                                                                                                              | Check the filename with `ls .bundle-snapshots bundle-snapshots`.                                                                                                     |
| `<label> matches <file> and <file>`                                                               | Two snapshots on different commits carry the same `--label`.                                                                                                                                                               | Pass the filename instead of the label.                                                                                                                              |
| `these snapshots differ in <fields>, so they were not measured the same way`                      | The two files came from different versions of the script.                                                                                                                                                                  | Re-take the older snapshot with the current script.                                                                                                                  |
