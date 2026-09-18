# Survey CDN Release Script

CLI utility to publish, archive, and version survey definitions (JSON) to DigitalOcean Spaces for consumption by the LiteFarm webapp.

## Purpose & Architecture

Surveys are stored under `tape_surveys/` in an environment bucket, in three formats:

1. **Unversioned latest pointers:** `tape_surveys/<subfolder>/<survey>.json` (e.g. `tape_surveys/fao/step01.json`)
2. **Immutable versioned archives:** `tape_surveys/<subfolder>/<survey>/<version>.json` (e.g. `tape_surveys/fao/step01/2026_v1.json`)
3. **Version manifest:** `tape_surveys/versions.json` (maps all survey relative paths to their active version tag)

### Archiving Rules

- Only folders matching `fao/` and `fao_<lang>/` (e.g. `fao_es/`, `fao_pt/`) are archived.
- Every survey JSON file must declare a calculated `survey_version` expression in its definition.
- If an existing remote pointer has not been archived yet, the script archives that snapshot before overwriting the latest pointer.

---

## File Structure

```
packages/api/scripts/surveyCdnRelease/
├── spacesClient.ts     # DigitalOcean Spaces S3 client, auth, read/write/list operations
├── surveySources.ts    # Reads surveys from disk/bucket, parses versions, builds S3 keys
├── versionManifest.ts  # Fetches, merges, and updates versions.json
├── publishToCdn.ts     # Planning engine (diffs/states) and upload execution pipeline
└── index.ts            # CLI argument parsing, status output, and process lifecycle
```

### Module Responsibilities

| File                     | Responsibilities                                                                                                                                                                                                            |
| :----------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`spacesClient.ts`**    | Resolves target bucket per environment, configures `@aws-sdk/client-s3` client, encapsulates `readObjectBody`, `putObject`, `listObjectKeys`, and error matching (`isMissingObject`).                                       |
| **`surveySources.ts`**   | Reads JSON files from local directories or remote buckets. Extracts embedded `survey_version` strings and computes immutable archive destination keys.                                                                      |
| **`versionManifest.ts`** | Reads, merges, and writes the central `<surveyDirectory>/versions.json` manifest on Spaces.                                                                                                                                 |
| **`publishToCdn.ts`**    | Compares incoming surveys against existing bucket state. Determines diff states (`new`, `unchanged`, `differs`), checks unarchived pointers, writes versioned copies, updates latest pointers, and updates `versions.json`. |
| **`index.ts`**           | CLI entry point. Parses flags (`parseArgs`), formats terminal report tables, logs summary metrics, and handles exit codes.                                                                                                  |

---

## Prerequisites & Environment Variables

The script requires DigitalOcean Spaces API credentials:

```bash
SURVEY_CDN_ACCESS_KEY_ID="your_access_key"
SURVEY_CDN_SECRET_ACCESS_KEY="your_secret_key"
```

These are loaded automatically from `packages/api/.env` via `dotenvConfig.js` or directly from the execution shell.

---

## Shell Alias (Run from any folder)

To run the script directly from your local survey directories without typing long repository paths or navigating to `packages/api`:

Add an alias to your `~/.zshrc` (or `~/.bashrc`):

```bash
alias publish-surveys="npm --prefix /Users/joyce/LiteFarm/packages/api run publish-surveys --"
```

Reload your shell:

```bash
source ~/.zshrc
```

Now you can run `publish-surveys` directly from anywhere on your machine.

---

## Usage & CLI Options

From inside a survey directory (using the shell alias):

```bash
publish-surveys --env <environment> [options] [path]
```

Or from `packages/api` via npm:

```bash
npm run publish-surveys -- --env <environment> [options] [path]
```

### Options

| Option            | Type              | Description                                                                                                                          |
| :---------------- | :---------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| `--env <names>`   | String (required) | Target environment(s), comma-separated or repeated: `development`, `integration`, `production`.                                      |
| `--from-bucket`   | Boolean           | Re-publishes/re-manifests files currently on the bucket instead of local files.                                                      |
| `--report`        | Boolean           | Dry run mode. Calculates diffs and prints the report without writing any files to S3.                                                |
| `--refresh`       | Boolean           | Overwrites an existing archived version copy if the contents differ (by default, differing existing archives are preserved/skipped). |
| `--prefix <path>` | String            | Sub-path under `tape_surveys` to prefix incoming files (useful when publishing a partial folder like `fao_es/` or single files).     |
| `[path]`          | Positional        | Path to a single survey JSON file or directory of survey files on disk. Pass `.` when inside the target folder.                      |

---

## Examples

### 1. Dry run a local release to development (from survey folder)

```bash
publish-surveys --env development --report .
```

### 2. Publish a full set of surveys to development & integration

```bash
publish-surveys --env development,integration .
```

### 3. Publish a single language folder

```bash
cd <path-to-surveys>/2026_release/fao_es
publish-surveys --env integration --prefix fao_es .
```

### 4. Regenerate manifest and version archives from files already on the bucket

```bash
publish-surveys --env production --from-bucket
```

### 5. Hotfix a single survey file typo or bug (version string unchanged)

Overwrites both the latest pointer (`tape_surveys/fao/step01.json`) and the existing versioned archive (`tape_surveys/fao/step01/2026_v1.json`) for a single file:

```bash
cd <path-to-surveys>/2026_release/fao
publish-surveys --env development --refresh --prefix fao step01.json
```
