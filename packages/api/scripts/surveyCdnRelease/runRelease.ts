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

import { GetObjectCommand } from '@aws-sdk/client-s3';
import { BucketTarget } from './bucketTarget.js';
import { SurveyFile, VersionedSurveyFile, putObject, resolveSurveyFiles } from './surveyObjects.js';
import { VersionManifest, isMissingObject, writeVersionManifest } from './versionManifest.js';

export type SurveyFileState = 'new' | 'unchanged' | 'differs';

export interface SurveyFileReport {
  latestObjectKey: string;
  archivedObjectKey: string;
  version: string;
  state: SurveyFileState;
}

export interface ReleaseOptions {
  refresh?: boolean;
  reportOnly?: boolean;
}

export interface ReleaseResult {
  reports: SurveyFileReport[];
  archivedObjectKeysWritten: string[];
  latestObjectKeysWritten: string[];
  manifest?: VersionManifest;
}

interface InspectedSurveyFile {
  file: VersionedSurveyFile;
  state: SurveyFileState;
}

async function readObjectBody(target: BucketTarget, key: string): Promise<string | undefined> {
  try {
    const response = await target.client.send(
      new GetObjectCommand({ Bucket: target.bucket, Key: key }),
    );

    return await response.Body?.transformToString();
  } catch (error) {
    if (isMissingObject(error)) {
      return undefined;
    }

    throw error;
  }
}

async function inspectSurveyFiles(
  target: BucketTarget,
  files: VersionedSurveyFile[],
): Promise<InspectedSurveyFile[]> {
  const inspected: InspectedSurveyFile[] = [];

  for (const file of files) {
    const archived = await readObjectBody(target, file.archivedObjectKey);

    if (archived === undefined) {
      inspected.push({ file, state: 'new' });
    } else if (archived === file.body) {
      inspected.push({ file, state: 'unchanged' });
    } else {
      inspected.push({ file, state: 'differs' });
    }
  }

  return inspected;
}

function toReport({ file, state }: InspectedSurveyFile): SurveyFileReport {
  return {
    latestObjectKey: file.latestObjectKey,
    archivedObjectKey: file.archivedObjectKey,
    version: file.version,
    state,
  };
}

function shouldWriteArchivedObject(state: SurveyFileState, refresh?: boolean): boolean {
  return state === 'new' || (state === 'differs' && Boolean(refresh));
}

function shouldWriteLatestObject(state: SurveyFileState): boolean {
  return state !== 'unchanged';
}

export async function reportSurveyFiles(
  target: BucketTarget,
  files: SurveyFile[],
): Promise<SurveyFileReport[]> {
  const inspected = await inspectSurveyFiles(target, resolveSurveyFiles(files));

  return inspected.map(toReport);
}

export async function runRelease(
  target: BucketTarget,
  surveyDirectory: string,
  files: SurveyFile[],
  options: ReleaseOptions = {},
): Promise<ReleaseResult> {
  const resolved = resolveSurveyFiles(files);
  const inspected = await inspectSurveyFiles(target, resolved);
  const reports = inspected.map(toReport);

  if (options.reportOnly) {
    return { reports, archivedObjectKeysWritten: [], latestObjectKeysWritten: [] };
  }

  const archivedObjectKeysWritten: string[] = [];
  const latestObjectKeysWritten: string[] = [];

  // Write immutable archive copies (for new versions or explicit refresh overrides)
  for (const { file, state } of inspected) {
    if (shouldWriteArchivedObject(state, options.refresh)) {
      await putObject(target, file.archivedObjectKey, file.body);
      archivedObjectKeysWritten.push(file.archivedObjectKey);
    }
  }

  // Update mutable latest pointer files for any non-identical content
  for (const { file, state } of inspected) {
    if (shouldWriteLatestObject(state)) {
      await putObject(target, file.latestObjectKey, file.body);
      latestObjectKeysWritten.push(file.latestObjectKey);
    }
  }

  // Update directory versions.json manifest
  const manifest = await writeVersionManifest(target, surveyDirectory, resolved);

  return { reports, archivedObjectKeysWritten, latestObjectKeysWritten, manifest };
}
