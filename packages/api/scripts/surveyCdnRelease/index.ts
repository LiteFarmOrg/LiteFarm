/*
 *  Copyright 2026 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { parseArgs } from 'node:util';
import '../../src/dotenvConfig.js';
import {
  PUBLISH_ENVIRONMENTS,
  TAPE_SURVEYS_DIRECTORY,
  resolveBucketTarget,
} from './spacesClient.js';
import {
  SurveyFile,
  isArchivedSurveyKey,
  readSurveyFilesFromBucket,
  readSurveyFilesFromDisk,
} from './surveySources.js';
import { SurveyFileReport, publishToCdn } from './publishToCdn.js';

const USAGE = `Usage: npm run publish-surveys -- --env <name[,name]> [options] [path]

  --env <names>    Target environments, comma separated or repeated. Required.
                   One of: ${PUBLISH_ENVIRONMENTS.join(', ')}.
  --from-bucket    Publish the files already on the bucket instead of local files.
  --report         Print what would be written and write nothing.
  --refresh        Replace an archive copy that differs under an existing version.
  --prefix <path>  Sub-path to insert under ${TAPE_SURVEYS_DIRECTORY}/, for a partial delivery.

  [path] is one file or one folder. The object key mirrors the path relative to
  what you pass, under ${TAPE_SURVEYS_DIRECTORY}/, so a delivery folder shaped like the
  bucket needs no other option. Point at fao_es/ alone and add --prefix fao_es.

  Only the archived directories are published: ${TAPE_SURVEYS_DIRECTORY}/fao/ and
  ${TAPE_SURVEYS_DIRECTORY}/fao_xx/. Anything else is listed as skipped and left untouched.

  SURVEY_CDN_ACCESS_KEY_ID and SURVEY_CDN_SECRET_ACCESS_KEY are read from the
  environment, or from packages/api/.env. A value set in the shell wins.`;

function parseEnvironments(values: string[] | undefined): string[] {
  return (values ?? [])
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean);
}

function printReports(reports: SurveyFileReport[]): void {
  for (const report of reports) {
    console.log(`  ${report.state.padEnd(9)} ${report.latestObjectKey}  (${report.version})`);

    if (report.preservedArchivedObjectKey) {
      console.log(`  ${''.padEnd(9)} preserves ${report.preservedArchivedObjectKey}`);
    }
  }
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    options: {
      env: { type: 'string', multiple: true },
      'from-bucket': { type: 'boolean', default: false },
      prefix: { type: 'string' },
      report: { type: 'boolean', default: false },
      refresh: { type: 'boolean', default: false },
    },
    allowPositionals: true,
  });

  const environments = parseEnvironments(values.env);
  const fromBucket = values['from-bucket'];

  if (environments.length === 0) {
    throw new Error(`--env is required.\n\n${USAGE}`);
  }

  if (!fromBucket && positionals.length !== 1) {
    throw new Error(`Pass exactly one file or folder, or --from-bucket.\n\n${USAGE}`);
  }

  const targets = environments.map(resolveBucketTarget);

  const localFiles: SurveyFile[] | undefined = fromBucket
    ? undefined
    : await readSurveyFilesFromDisk(positionals[0], TAPE_SURVEYS_DIRECTORY, values.prefix);

  for (const target of targets) {
    const sourced = localFiles ?? (await readSurveyFilesFromBucket(target, TAPE_SURVEYS_DIRECTORY));
    const files = sourced.filter((file) =>
      isArchivedSurveyKey(file.latestObjectKey, TAPE_SURVEYS_DIRECTORY),
    );
    const skipped = sourced.length - files.length;

    console.log(`\n${target.environment} (${target.bucket}) — ${files.length} survey file(s)`);

    if (skipped > 0) {
      console.log(`  ${skipped} file(s) outside the archived directories, not published`);
    }

    if (files.length === 0) {
      continue;
    }

    const result = await publishToCdn(target, TAPE_SURVEYS_DIRECTORY, files, {
      refresh: values.refresh,
      reportOnly: values.report,
    });

    printReports(result.reports);

    if (values.report) {
      console.log('  nothing written (--report)');
      continue;
    }

    console.log(
      `  archives ${result.archivedObjectKeysWritten.length}, ` +
        `pointers ${result.latestObjectKeysWritten.length}, ` +
        `manifest entries ${Object.keys(result.manifest ?? {}).length}`,
    );
  }
}

main().catch((error: unknown) => {
  if (!(error instanceof Error)) {
    console.error(error);
    process.exitCode = 1;
    return;
  }

  const { httpStatusCode } =
    (error as Error & { $metadata?: { httpStatusCode?: number } }).$metadata ?? {};
  const label = error.name && error.name !== 'Error' ? `${error.name}: ` : '';
  const status = httpStatusCode ? ` (HTTP ${httpStatusCode})` : '';

  console.error(`${label}${error.message}${status}`);
  process.exitCode = 1;
});
