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

import { readFile, readdir, stat } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { BucketTarget, listObjectKeys, readObjectBody } from './spacesClient.js';

export const ARCHIVED_DIRECTORY_PATTERN = /^fao(_[a-z]{2})?$/;

export interface SurveyFile {
  latestObjectKey: string;
  body: string;
}

export interface VersionedSurveyFile extends SurveyFile {
  version: string;
  archivedObjectKey: string;
}

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

export function getArchiveKey(latestObjectKey: string, version: string): string {
  return `${latestObjectKey.replace(/\.json$/, '')}/${version}.json`;
}

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
