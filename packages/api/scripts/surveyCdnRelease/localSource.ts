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
import { SurveyFile } from './surveyObjects.js';

export const SURVEY_LANGUAGE_CODES = ['fr', 'es', 'pt', 'it'];

export const LANGUAGE_DIRECTORY_PATTERN = /^fao(_[a-z]{2})?$/;

export function getLanguageDirectory(filePath: string): string {
  const parentDirectory = basename(dirname(filePath));

  if (LANGUAGE_DIRECTORY_PATTERN.test(parentDirectory)) {
    return parentDirectory;
  }

  const stem = basename(filePath, '.json');
  const code = stem.slice(-2);

  if (stem.at(-3) === '_' && SURVEY_LANGUAGE_CODES.includes(code)) {
    return `fao_${code}`;
  }

  return 'fao';
}

export function getLatestObjectKey(filePath: string, surveyDirectory: string): string {
  return `${surveyDirectory}/${getLanguageDirectory(filePath)}/${basename(filePath)}`;
}

export async function listJsonFiles(path: string): Promise<string[]> {
  const stats = await stat(path);

  if (stats.isFile()) {
    return path.endsWith('.json') ? [path] : [];
  }

  const entries = await readdir(path, { recursive: true });

  return entries
    .filter((entry) => entry.endsWith('.json'))
    .map((entry) => join(path, entry))
    .sort();
}

export async function readSurveyFilesFromDisk(
  path: string,
  surveyDirectory: string,
): Promise<SurveyFile[]> {
  const filePaths = await listJsonFiles(path);
  const files: SurveyFile[] = [];

  for (const filePath of filePaths) {
    files.push({
      latestObjectKey: getLatestObjectKey(filePath, surveyDirectory),
      body: await readFile(filePath, 'utf8'),
    });
  }

  return files;
}
