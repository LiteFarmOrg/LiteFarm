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

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { BucketTarget, OBJECT_WRITE_DEFAULTS } from './bucketTarget.js';

export interface SurveyFile {
  /** S3 object key for the latest/unversioned file (e.g. 'fao/step01.json') */
  latestObjectKey: string;
  body: string;
}

export interface VersionedSurveyFile extends SurveyFile {
  version: string;
  /** S3 object key for the versioned archive (e.g. 'fao/step01/2026_v1.json') */
  archivedObjectKey: string;
}

/**
 * Extracts the `survey_version` calculated value defined inside the Survey JSON
 */
export function readSurveyVersion(body: string): string | undefined {
  try {
    const parsed = JSON.parse(body) as {
      calculatedValues?: Array<{ name?: string; expression?: string }>;
    };

    const expression = parsed?.calculatedValues?.find(
      (calculatedValue) => calculatedValue.name === 'survey_version',
    )?.expression;

    if (typeof expression !== 'string') {
      return undefined;
    }

    return expression.replace(/^['"](.*)['"]$/, '$1');
  } catch {
    return undefined;
  }
}

/**
 * Derives the immutable versioned S3 key from the base pointer key
 *
 * @example getArchiveKey('fao/tape.json', '2026_v1') => 'fao/tape/2026_v1.json'
 */
export function getArchiveKey(latestObjectKey: string, version: string): string {
  return `${latestObjectKey.replace(/\.json$/, '')}/${version}.json`;
}

/**
 * Resolves each survey file's embedded version and constructs its archived S3 destination key
 */
export function resolveSurveyFiles(files: SurveyFile[]): VersionedSurveyFile[] {
  return files.map((file) => {
    const version = readSurveyVersion(file.body);

    if (!version) {
      throw new Error(`${file.latestObjectKey} carries no valid survey_version value.`);
    }

    return {
      ...file,
      version,
      archivedObjectKey: getArchiveKey(file.latestObjectKey, version),
    };
  });
}

async function putObject(target: BucketTarget, key: string, body: string): Promise<void> {
  await target.client.send(
    new PutObjectCommand({
      ...OBJECT_WRITE_DEFAULTS,
      Bucket: target.bucket,
      Key: key,
      Body: body,
    }),
  );
}

/**
 * Adds surveys to the target Spaces bucket in two stages:
 * 1. Writes the versioned immutable snapshot
 * 2. Updates the "latest" file
 */
export async function writeSurveyFiles(
  target: BucketTarget,
  files: VersionedSurveyFile[],
): Promise<void> {
  for (const file of files) {
    await putObject(target, file.archivedObjectKey, file.body);
  }

  for (const file of files) {
    await putObject(target, file.latestObjectKey, file.body);
  }
}
