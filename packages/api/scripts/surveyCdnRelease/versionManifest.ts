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

import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { BucketTarget, OBJECT_WRITE_DEFAULTS } from './bucketTarget.js';
import { VersionedSurveyFile } from './publishSurveys.js';

export type VersionManifest = Record<string, string>;

export const VERSION_MANIFEST_FILENAME = 'versions.json';

export function getVersionManifestKey(surveyDirectory: string): string {
  return `${surveyDirectory}/${VERSION_MANIFEST_FILENAME}`;
}

export function getVersionManifestEntryKey(
  latestObjectKey: string,
  surveyDirectory: string,
): string {
  const prefix = `${surveyDirectory}/`;
  const relativeKey = latestObjectKey.startsWith(prefix)
    ? latestObjectKey.slice(prefix.length)
    : latestObjectKey;

  return relativeKey.replace(/\.json$/, '');
}

function isMissingObject(error: unknown): boolean {
  const { name, $metadata } = (error ?? {}) as {
    name?: string;
    $metadata?: { httpStatusCode?: number };
  };

  return name === 'NoSuchKey' || $metadata?.httpStatusCode === 404;
}

export async function readVersionManifest(
  target: BucketTarget,
  surveyDirectory: string,
): Promise<VersionManifest> {
  try {
    const response = await target.client.send(
      new GetObjectCommand({
        Bucket: target.bucket,
        Key: getVersionManifestKey(surveyDirectory),
      }),
    );

    const body = await response.Body?.transformToString();

    return body ? (JSON.parse(body) as VersionManifest) : {};
  } catch (error) {
    if (isMissingObject(error)) {
      return {};
    }

    throw error;
  }
}

export function mergeVersionManifest(
  existing: VersionManifest,
  files: VersionedSurveyFile[],
  surveyDirectory: string,
): VersionManifest {
  const merged: VersionManifest = { ...existing };

  for (const file of files) {
    merged[getVersionManifestEntryKey(file.latestObjectKey, surveyDirectory)] = file.version;
  }

  return merged;
}

export async function writeVersionManifest(
  target: BucketTarget,
  surveyDirectory: string,
  files: VersionedSurveyFile[],
): Promise<VersionManifest> {
  const existing = await readVersionManifest(target, surveyDirectory);
  const merged = mergeVersionManifest(existing, files, surveyDirectory);

  await target.client.send(
    new PutObjectCommand({
      ...OBJECT_WRITE_DEFAULTS,
      Bucket: target.bucket,
      Key: getVersionManifestKey(surveyDirectory),
      Body: JSON.stringify(merged, null, 2),
    }),
  );

  return merged;
}
