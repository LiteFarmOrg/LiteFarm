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

import { BucketTarget, putObject, readObjectBody } from './spacesClient.js';
import { VersionedSurveyFile } from './surveySources.js';

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

export async function readVersionManifest(
  target: BucketTarget,
  surveyDirectory: string,
): Promise<VersionManifest> {
  const body = await readObjectBody(target, getVersionManifestKey(surveyDirectory));

  return body ? (JSON.parse(body) as VersionManifest) : {};
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
): Promise<{ manifest: VersionManifest; changedEntryCount: number }> {
  const existing = await readVersionManifest(target, surveyDirectory);
  const merged = mergeVersionManifest(existing, files, surveyDirectory);

  await putObject(target, getVersionManifestKey(surveyDirectory), JSON.stringify(merged, null, 2));

  return {
    manifest: merged,
    changedEntryCount: Object.keys(merged).filter((key) => existing[key] !== merged[key]).length,
  };
}
