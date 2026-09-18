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

import { resolve } from 'node:path';
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

const USAGE = `Usage: npm run publish-surveys -- --env <name[,name]> [options] <path | --from-bucket>

  --env <names>    Target environments, comma separated or repeated. Required.
                   One of: ${PUBLISH_ENVIRONMENTS.join(', ')}.
  --from-bucket    Publish the files already on the bucket instead of local files.
  --report         Print what would be written and write nothing.
  --refresh        Replace an archive copy that differs under an existing version.
  --prefix <path>  Sub-path to insert under ${TAPE_SURVEYS_DIRECTORY}/, for a partial delivery.
  -h, --help       Show this help message.

  <path> is one file or one folder (required unless --from-bucket is passed).
  The object key mirrors the path relative to what you pass, under ${TAPE_SURVEYS_DIRECTORY}/,
  so a delivery folder shaped like the bucket needs no other option. Point at fao_es/ alone
  and add --prefix fao_es.

  Only the archived directories are published: ${TAPE_SURVEYS_DIRECTORY}/fao/ and
  ${TAPE_SURVEYS_DIRECTORY}/fao_xx/ (e.g. fao_es/, fao_pt/). Anything else is listed as skipped and left untouched.

  SURVEY_CDN_ACCESS_KEY_ID and SURVEY_CDN_SECRET_ACCESS_KEY are read from the
  environment, or from packages/api/.env. A value set in the shell wins.`;

function parseEnvironments(values: string[] | undefined): string[] {
  return (values ?? [])
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean);
}

type PublishOutcome = 'version-bump' | 'refreshed' | 'pointer-sync' | 'differs' | 'up-to-date';

const OUTCOME_ORDER: PublishOutcome[] = [
  'differs',
  'version-bump',
  'refreshed',
  'pointer-sync',
  'up-to-date',
];

const OUTCOME_HEADINGS: Record<PublishOutcome, string> = {
  differs:
    '! Version conflict: archive already exists with different contents (use --refresh to replace)',
  'version-bump': '+ New version: archive created, live pointer updated',
  refreshed: '~ Archive refreshed (--refresh): overwritten existing archive and live pointer',
  'pointer-sync': '→ Live pointer updated: switched to existing version archive',
  'up-to-date': '✓ Up to date: no changes',
};

function getOutcome(report: SurveyFileReport, refresh: boolean): PublishOutcome {
  if (report.state === 'differs') {
    return refresh ? 'refreshed' : 'differs';
  }

  if (report.state === 'new' || report.preservedArchivedObjectKey === report.archivedObjectKey) {
    return 'version-bump';
  }

  if (report.isPointerUnchanged) {
    return 'up-to-date';
  }

  return 'pointer-sync';
}

function getSurveyStem(objectKey: string): string {
  return objectKey.slice(TAPE_SURVEYS_DIRECTORY.length + 1).replace(/\.json$/, '');
}

function formatVersionTransition(report: SurveyFileReport): string {
  if (report.state === 'differs') {
    return `${report.version} (modified)`;
  }

  if (!report.currentPointerVersion || report.currentPointerVersion === report.version) {
    return report.version;
  }

  return `${report.currentPointerVersion} -> ${report.version}`;
}

function printReports(reports: SurveyFileReport[], refresh: boolean): void {
  const items = reports.map((report) => ({
    report,
    outcome: getOutcome(report, refresh),
    stem: getSurveyStem(report.latestObjectKey),
  }));

  const stemWidth = Math.max(0, ...items.map(({ stem }) => stem.length));

  for (const outcome of OUTCOME_ORDER) {
    const group = items.filter((item) => item.outcome === outcome);

    if (group.length === 0) {
      continue;
    }

    console.log(`\n  ${OUTCOME_HEADINGS[outcome]} (${group.length})`);

    for (const { report, stem } of group) {
      const versionInfo = formatVersionTransition(report);

      console.log(`    ${stem.padEnd(stemWidth)}  ${versionInfo}`);

      if (
        report.preservedArchivedObjectKey &&
        report.preservedArchivedObjectKey !== report.archivedObjectKey
      ) {
        const rescued = getSurveyStem(report.preservedArchivedObjectKey);

        console.log(`    ${' '.repeat(stemWidth)}  archived previous live version to ${rescued}`);
      }
    }
  }

  console.log('');
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    options: {
      env: { type: 'string', multiple: true },
      'from-bucket': { type: 'boolean', default: false },
      prefix: { type: 'string' },
      report: { type: 'boolean', default: false },
      refresh: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
    allowPositionals: true,
  });

  if (values.help) {
    console.log(USAGE);
    return;
  }

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
    : await readSurveyFilesFromDisk(
        resolve(process.env.INIT_CWD ?? process.cwd(), positionals[0]),
        TAPE_SURVEYS_DIRECTORY,
        values.prefix,
      );

  for (const target of targets) {
    const sourced = localFiles ?? (await readSurveyFilesFromBucket(target, TAPE_SURVEYS_DIRECTORY));
    const files = sourced.filter((file) =>
      isArchivedSurveyKey(file.latestObjectKey, TAPE_SURVEYS_DIRECTORY),
    );
    const skipped = sourced.length - files.length;

    console.log(
      `\n${target.environment} (${target.bucket}) — ` +
        `${TAPE_SURVEYS_DIRECTORY}/ — ${files.length} survey file(s)`,
    );

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

    printReports(result.reports, values.refresh);

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
