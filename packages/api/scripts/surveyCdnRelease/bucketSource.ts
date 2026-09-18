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
import { BucketTarget } from './bucketTarget.js';
import { SurveyFile } from './surveyObjects.js';
import { readObjectBody } from './publishToCdn.js';

export const ARCHIVED_DIRECTORY_PATTERN = /^fao(_[a-z]{2})?$/;

export function isSurveyPointerKey(objectKey: string, surveyDirectory: string): boolean {
  const prefix = `${surveyDirectory}/`;

  if (!objectKey.startsWith(prefix) || !objectKey.endsWith('.json')) {
    return false;
  }

  const segments = objectKey.slice(prefix.length).split('/');

  if (segments.length !== 2) {
    return false;
  }

  return ARCHIVED_DIRECTORY_PATTERN.test(segments[0]);
}

export async function listSurveyPointers(
  target: BucketTarget,
  surveyDirectory: string,
): Promise<string[]> {
  const pointerKeys: string[] = [];
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
      if (object.Key && isSurveyPointerKey(object.Key, surveyDirectory)) {
        pointerKeys.push(object.Key);
      }
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return pointerKeys.sort();
}

export async function readSurveyFilesFromBucket(
  target: BucketTarget,
  surveyDirectory: string,
): Promise<SurveyFile[]> {
  const pointerKeys = await listSurveyPointers(target, surveyDirectory);
  const files: SurveyFile[] = [];

  for (const latestObjectKey of pointerKeys) {
    const body = await readObjectBody(target, latestObjectKey);

    if (body !== undefined) {
      files.push({ latestObjectKey, body });
    }
  }

  return files;
}
