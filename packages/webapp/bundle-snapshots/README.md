# Bundle snapshots

> Measure what a build of the webapp costs to download, and compare two builds

This tool consists of two scripts that are used together:

- **`pnpm bundle-snapshot`** builds the webapp and writes a JSON file describing every file in `dist` (except sourcemaps) with its raw, gzipped and network size, its content hash, and whether it's in the Workbox precache manifest
- **`pnpm bundle-compare`** reads two of those files and reports what changed, including what a user already on the older build has to fetch to reach the newer one

This page covers how to:

- [Understand what a snapshot measures](#what-a-snapshot-measures)
- [Take a snapshot](#taking-a-snapshot) of the current tree or release
- [Compare two snapshots](#comparing-two-snapshots) and read the four output blocks
- [Read a snapshot file](#reading-a-snapshot-file) directly
- [Recover](#when-a-run-fails) when a run refuses to finish

## What a snapshot measures

Every measured file is in exactly one of two buckets, decided by whether it is listed in the Workbox precache manifest

| Bucket            | Covers                                                                                                     | Examples                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **precache**      | The manifest lists it, so the service worker fetches it at install, whether or not the user ever needs it. | Route chunks, the framework vendor chunk, CSS, SVG components, locale chunks, `index.html` |
| **not precached** | The manifest does not list it, so it is fetched only when something asks for it.                           | Crop images, the `public/locales` JSON, fonts, the survey vendor chunk, `sw.js`            |

The precache total is what a first visit costs. The not-precached total is the size of everything that could be requested. (Note: most of that is crop images!)

Each file also carries a category, which says what kind of file it is:

| Category                      | Covers                                                                                                                                                   |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `js chunk`                    | Any chunk Rollup emitted that is not one of the named chunks below.                                                                                      |
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

## Taking a snapshot

```bash
# measure the current tree
pnpm bundle-snapshot

# measure it under a name you will recognise later
pnpm bundle-snapshot --label vite5

# measure a release, into the git tracked directory
pnpm bundle-snapshot --release
```

The script runs `pnpm build` itself, so it will take a few minutes to complete. Each run prints where it wrote, the commit and version it describes, and the two bucket totals.

| Flag             | Effect                                                                                                                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (none)           | Builds, then writes `<shortSha>.json` to the gitignored `.bundle-snapshots/`. A dirty tree is measured, recorded as `dirty: true`, and listed path by path.                                          |
| `--label <name>` | Adds the label to the filename, `<shortSha>-<name>.json`, and records it in the snapshot. The name must be filename-safe: it starts with a letter or a digit, and the rest may add `.`, `_` and `-`. |
| `--release`      | Writes `<version>-<shortSha>.json` to this directory, which is tracked. Refuses to run on a dirty tree.                                                                                              |

### Measure a branch against integration

1. Check out `integration` and pull.
2. Run `pnpm bundle-snapshot --label integration`. The build takes several minutes.
3. Check out the branch under test.
4. Run `pnpm bundle-snapshot --label <branch-name>`.
5. Diff them, older first — see [Comparing two snapshots](#comparing-two-snapshots).

Both files stay in `.bundle-snapshots/`, which is gitignored.

### Take a release snapshot

  > [!TIP]
  > To build the release snapshot, use the
  > [release's tagged commit](https://github.com/LiteFarmOrg/LiteFarm/releases/latest). It is
  > easiest to snapshot just after release.

1. Check out the released commit.
2. Run `git status` and stash every path it lists: `git stash push <path>`.
3. Run `pnpm bundle-snapshot --release`.
4. Check that the printed filename carries the version and short SHA you expect, then `git add` it.

### The build environment is pinned

Vite inlines `import.meta.env` values at build time, so differing `.env` variables will alter file hashes. Since some of the files that import from `.env` (`apiConfig.js` and `util/constants.js`) are themselves read throughout the app, a single changed variable can re-hash a majority of the JS (CSS, SVG, and locale chunks would be untouched).

Therefore, the script sets its own fixed values in the build's environment, where Vite gives them priority over every `.env` file. The two consequences are:

- **Your `.env` does not affect the result.** Committed snapshots can be compared across developer environments.
- **JS content hashes will not match production's.** The actual hashes on `app.litefarm.org` will not match what this script snapshots, but the size comparisons (which are local-to-local) will hold.

## Comparing two snapshots

```bash
# older snapshot first
pnpm bundle-compare <older> <newer>
```

Snapshots can be specified as a full path, a filename, a bare `--label` value, or a version (for releases). E.g.

```bash
pnpm bundle-compare 3.13.1 integration
pnpm bundle-compare integration mybranch
pnpm bundle-compare .bundle-snapshots/a1b2c3d-integration.json .bundle-snapshots/e4f5g6h-mybranch.json
pnpm bundle-compare a1b2c3d-integration e4f5g6h-mybranch


```

A label has to pick out one file. If two snapshots are labelled the same, but taken on different commits, the run fails and names both files.

The script refuses to run when the two snapshots differ in `schema`, `gzipLevel` or `gzipMinLength`, since those mean the two files were not measured the same way. When they disagree on `envFingerprint`, `node` or `vite`, it prints a warning naming that field and continues.

### Reading the output

| Block            | Content                                                                                                                                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FIRST INSTALL`  | The precache bucket: file count, network size, the change in KB and percent, and the seconds it takes at 400 kbps                                                                                                 |
| `NOT PRECACHED`  | The non-precached bucket, as a total and then per category                                                                                                                                                        |
| `UPDATE`         | What a user already on the older build fetches, in entries, MB, seconds at 400 kbps, and as a share of a first install. Then `reused from cache`, and for entries Workbox deletes, `removed from cache`           |
| `BIGGEST MOVERS` | The fifteen largest network changes by name, each with its file count when the name covers more than one, then every added and removed name. A list longer than forty entries ends with a count of the remainder. |

The `fetched` section of UPDATE is divided into the following mutually exclusive (non-overlapping) buckets:

| Row                            | Means                                                                                                                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `entry chunk`                  | The chunk `index.html` loads as a module, named with its content hash. This is the largest `index.js` chunk and is rebuilt on every release, so its 400 kB is the current release cost floor. |
| `name older build already had` | Only one file in both builds carries this name. This is the only row where a file can be traced across builds.                                                                                |
| `name shared by many files`    | Several files in this build carry these names                                                                                                                                                 |
| `name new to this build`       | The older build had no file by that name.                                                                                                                                                     |

With our current configuration, the shared name holds most of the bytes.

`UPDATE` and `BIGGEST MOVERS` group files by filename with the content hash removed, so `/assets/index-BfFsbPPC.js` counts under `/assets/index.js`. Several files can share one such name, with index.js being the biggest offender.

## Reading a snapshot file

You do not normally need to read a snapshot file, because `bundle-compare` reads both of them and reports the numbers. But you can always open it or ask an agent to query it for information that isn't included in the compare script.

| Field            | Meaning                                                |
| ---------------- | ------------------------------------------------------ |
| `schema`         | Snapshot format version                                |
| `commit`         | `sha`, `shortSha`, `branch`, `dirty`                   |
| `version`        | From `packages/webapp/package.json`                    |
| `label`          | The `--label` value, or `null`                         |
| `gzipLevel`      | `6`, matching `gzip_comp_level` in `nginx.conf`        |
| `gzipMinLength`  | `1024`, matching `gzip_min_length` in `nginx.conf`     |
| `node`           | The Node version that measured the build               |
| `vite`           | The installed Vite version, which set the chunk layout |
| `envFingerprint` | SHA-256 of the pinned environment                      |
| `entry`          | The urls `index.html` loads as a module                |
| `totals`         | `precached` and `onDemand`                             |
| `files`          | One entry per measured file, sorted by `url`           |

Each of the 1k+ entries in `files` has the following keys:

| Field        | Meaning                                                                                                                                                                                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`        | Path inside `dist`, with a leading slash                                                                                                                                                                                                |
| `stableName` | `url` with the content hash removed, so `/assets/index-BfFsbPPC.js` becomes `/assets/index.js`                                                                                                                                          |
| `hash`       | The content hash, or `null` for a file Vite does not hash                                                                                                                                                                               |
| `raw`        | Decompressed bytes. What Cache Storage holds.                                                                                                                                                                                           |
| `gz`         | Bytes at gzip level 6, whether or not nginx would send it that way.                                                                                                                                                                     |
| `transfer`   | What crosses the network/what a metered user pays. `gz` when `nginx.conf` compresses the response, and `raw` when it doesn't: every file under `gzip_min_length`, and every type outside `gzip_types`, which includes fonts and images. |
| `category`   | One of the file type categories above.                                                                                                                                                                                                  |
| `precached`  | Whether the precache manifest lists this file.                                                                                                                                                                                          |
| `revision`   | Workbox's cache key, for a manifest entry that carries no content hash. `null` otherwise.                                                                                                                                               |

Snapshots hold no timestamps and no absolute paths, and `files` is sorted, so two builds of an unchanged tree produce byte-identical JSON.

## Committed snapshots

Only the files in this directory are tracked, named `<version>-<shortSha>.json`. Everything written without `--release` goes to the gitignored `.bundle-snapshots/`.

Any two snapshots can be compared for size, released or not, but the update figure only has true meaning for released builds (the ones that client devices actually hold).

Local snapshots have no retention rule, and you can delete them when you're done.

> [!TIP]
> For a comparison value you want to keep, record it on the relevant Jira ticket.

## When a run fails

Here are the possible error messages the scripts can output:

| Message                                                                                                     | Cause                                                                                                                                                                                                                      | What to do                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/ reads <keys>, which the pinned environment does not account for`                                      | A file under `src/` reads an `import.meta.env.VITE_*` key the script does not know about, so the build would take that value from whatever `.env` you have.                                                                | In `scripts/bundle-snapshot.mjs`, add the key to `PINNED_ENV` with a dummy value if a deployed build sets it, or to `BLANKED_ENV` if only a local `.env` carries it. |
| `https://snapshot.invalid does not appear in the built output`                                              | The pinned environment did not reach Vite, so the build ran under an environment the snapshot cannot name. Checked on every run.                                                                                           | Check that `pnpm build` still passes the process environment through to Vite.                                                                                        |
| `<url> is under /assets/ but carries no recognised content hash`                                            | The hash pattern matches neither the Rollup 3 form, eight lowercase hex as in `crop-0de75771.js`, nor the Rollup 4 form, eight mixed-case base64url as in `index-BfFsbPPC.js`. A build tool upgrade can introduce a third. | Update `HASH_PATTERN` in `scripts/bundle-snapshot.mjs`. Until it matches, `stableName` will be wrong                                                                 |
| `the built output names <keys>, which the pinned environment does not account for`                          | A bare `import.meta.env` put the whole environment object into the bundle, keys and all, so those values came from the `.env` on this machine.                                                                             | Add each key to `PINNED_ENV` or `BLANKED_ENV`, or remove the bare read from the app code.                                                                            |
| `a release snapshot must describe a committed tree`                                                         | `--release` on a dirty tree. The message lists every modified path.                                                                                                                                                        | Stash the listed paths, then run again.                                                                                                                              |
| `git ignores <n> locale files under public/, and src/locales/i18n.js globs each one into a precached chunk` | Ignored JSON under `public/locales/`. `src/locales/i18n.js` globs each one into a precached chunk, which is build output the script cannot filter.                                                                         | Delete the listed files, then run again.                                                                                                                             |
| `git check-ignore failed`                                                                                   | `git check-ignore` did not run, so the script can't tell which files under `public/` git ignores and would measure files no deployed build has.                                                                            | Read the quoted git error.                                                                                                                                           |
| `node_modules/vite is missing, so the Vite version cannot be recorded`                                      | No installed Vite to read a version from.                                                                                                                                                                                  | Run `pnpm install`.                                                                                                                                                  |
| `dist/sw.js is missing, so there is no precache manifest to read`                                           | The build produced no service worker, so precached files cannot be separated from the rest.                                                                                                                                | Check the build output for a `vite-plugin-pwa` failure.                                                                                                              |
| `dist/index.html is missing, so the entry chunks cannot be identified`                                      | The build produced no HTML entry point.                                                                                                                                                                                    | Check the build output for a failure.                                                                                                                                |
| `no module script tag in dist/index.html carries a src, so the entry chunks cannot be identified`           | Vite emitted the entry script in a shape the pattern in `entryUrls()` does not match, most likely after a Vite upgrade.                                                                                                    | Update that pattern in `scripts/bundle-snapshot.mjs`.                                                                                                                |
| `the precache manifest in dist/sw.js is empty or could not be parsed`                                       | Workbox emitted the manifest in a shape the pattern in `readManifest()` does not match, most likely after a Workbox upgrade.                                                                                               | Update that pattern in `scripts/bundle-snapshot.mjs`.                                                                                                                |
| `the precache manifest lists files that are not in dist`                                                    | The manifest and the directory disagree, usually a stale `dist` left by an interrupted build.                                                                                                                              | Delete `packages/webapp/dist`, then run again.                                                                                                                       |
| `no snapshot found for <name>`                                                                              | No path, filename or label matches, in the working directory or in either snapshot directory.                                                                                                                              | Check the filename with `ls .bundle-snapshots bundle-snapshots`.                                                                                                     |
| `<label> matches <file> and <file>`                                                                         | Two snapshots on different commits carry the same `--label`.                                                                                                                                                               | Pass the filename instead of the label.                                                                                                                              |
| `these snapshots differ in <fields>, so they were not measured the same way`                                | The two files came from different versions of the script.                                                                                                                                                                  | Re-take the older snapshot with the current script.                                                                                                                  |
