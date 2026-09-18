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

import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { readFile, readdir, stat } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { BucketTarget } from './bucketTarget.js';
import { SurveyFile } from './surveyObjects.js';
import { readObjectBody } from './publishToCdn.js';

export const ARCHIVED_DIRECTORY_PATTERN = /^fao(_[a-z]{2})?$/;

export function isArchivedSurveyKey(objectKey: string, surveyDirectory: string): boolean {
  const directoryPrefix = `${surveyDirectory}/`;

  if (!objectKey.startsWith(directoryPrefix) || !objectKey.endsWith('.json')) {
    return false;
  }

  const segments = objectKey.slice(directoryPrefix.length).split('/');

  return segments.length === 2 && ARCHIVED_DIRECTORY_PATTERN.test(segments[0]);
}

export function buildObjectKey(
  relativePath: string,
  surveyDirectory: string,
  prefix?: string,
): string {
  return [surveyDirectory, prefix, relativePath.split(/[\\/]/).join('/')].filter(Boolean).join('/');
}

export async function listObjectKeys(
  target: BucketTarget,
  surveyDirectory: string,
): Promise<string[]> {
  const objectKeys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await target.client.send(
      new ListObjectsV2Command({
        Bucket: target.bucket,
        Prefix: `${surveyDirectory}/`,
        ContinuationToken: continuationToken,
      }),
    );

    for (const object of response.Contents ?? []) {
      if (object.Key) {
        objectKeys.push(object.Key);
      }
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return objectKeys;
}

export async function readSurveyFilesFromBucket(
  target: BucketTarget,
  surveyDirectory: string,
): Promise<SurveyFile[]> {
  const objectKeys = await listObjectKeys(target, surveyDirectory);
  const files: SurveyFile[] = [];

  for (const latestObjectKey of objectKeys.sort()) {
    if (!isArchivedSurveyKey(latestObjectKey, surveyDirectory)) {
      continue;
    }

    const body = await readObjectBody(target, latestObjectKey);

    if (body !== undefined) {
      files.push({ latestObjectKey, body });
    }
  }

  return files;
}

export async function readSurveyFilesFromDisk(
  path: string,
  surveyDirectory: string,
  prefix?: string,
): Promise<SurveyFile[]> {
  const stats = await stat(path);

  const relativePaths = stats.isFile()
    ? [basename(path)]
    : (await readdir(path, { recursive: true })).filter((entry) => entry.endsWith('.json')).sort();

  const root = stats.isFile() ? dirname(path) : path;
  const files: SurveyFile[] = [];

  for (const relativePath of relativePaths) {
    files.push({
      latestObjectKey: buildObjectKey(relativePath, surveyDirectory, prefix),
      body: await readFile(join(root, relativePath), 'utf8'),
    });
  }

  return files;
}
