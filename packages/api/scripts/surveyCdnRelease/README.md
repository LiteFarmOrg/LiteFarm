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

## File Structure and Responsibilities

```
packages/api/scripts/surveyCdnRelease/
├── spacesClient.ts     # DigitalOcean Spaces S3 client, auth, read/write/list operations
├── surveySources.ts    # Reads surveys from disk/bucket, parses versions, builds S3 keys
├── versionManifest.ts  # Fetches, merges, and updates versions.json
├── publishToCdn.ts     # Planning engine (diffs/states) and upload execution pipeline
└── index.ts            # CLI argument parsing, status output, and process lifecycle
```

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
alias publish-surveys="npm --prefix <path-to-LF>/LiteFarm/packages/api run publish-surveys --"
```

and reload your shell

Now you can run `publish-surveys` directly from anywhere on your machine.

---

## Usage & CLI Options

From inside a survey directory (using the shell alias):

```bash
publish-surveys --env <environment> [options] <path | --from-bucket>
```

Or from `packages/api` via npm:

```bash
npm run publish-surveys -- --env <environment> [options] <path | --from-bucket>
```

### Options

| Option            | Type              | Description                                                                                                                                                 |
| :---------------- | :---------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--env <names>`   | String (required) | Target environment(s), comma-separated or repeated: `development`, `integration`, `production`.                                                             |
| `--from-bucket`   | Boolean           | Re-publishes/re-manifests files currently on the bucket instead of local files.                                                                             |
| `--dry-run`       | Boolean           | Calculates diffs and prints the report without writing any files to S3.                                                                                     |
| `--refresh`       | Boolean           | Overwrites an existing archived version copy if the contents differ (by default, differing existing archives are preserved/skipped).                        |
| `--prefix <path>` | String            | Sub-path under `tape_surveys` to prefix incoming files (useful when publishing a partial folder like `fao_es/` or single files).                            |
| `-h, --help`      | Boolean           | Print the command-line usage and options.                                                                                                                   |
| `<path>`          | Positional        | Path to a single survey JSON file or directory of survey files on disk (required unless `--from-bucket` is passed). Pass `.` when inside the target folder. |

---

## Examples

### 1. Dry run a local release to development

```bash
cd <path-to-surveys>/2026_UPDATED/
publish-surveys --env development --dry-run .
```

### 2. Publish a full set of surveys to development & integration

```bash
publish-surveys --env development,integration .
```

### 3. Publish a single language folder

```bash
cd <path-to-surveys>/2026_ES_NEW/fao_es/
publish-surveys --env integration --prefix fao_es .
```

### 4. Regenerate manifest and version archives from files already on the bucket

```bash
publish-surveys --env production --from-bucket
```

### 5. Hotfix a single survey file typo or bug (version string unchanged)

Overwrites both the latest pointer (`tape_surveys/fao/step01.json`) and the existing versioned archive (`tape_surveys/fao/step01/2026_v1.json`) for a single file:

```bash
cd <path-to-surveys>/2026_09_18_fix/
publish-surveys --env development --refresh --prefix fao step01.json
```
