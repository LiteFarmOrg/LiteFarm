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
import {
  SurveyFile,
  VersionedSurveyFile,
  getArchiveKey,
  putObject,
  readSurveyVersion,
  resolveSurveyFiles,
} from './surveyObjects.js';
import { VersionManifest, isMissingObject, writeVersionManifest } from './versionManifest.js';

export type SurveyFileState = 'new' | 'unchanged' | 'differs';

export interface SurveyFileReport {
  latestObjectKey: string;
  archivedObjectKey: string;
  version: string;
  state: SurveyFileState;
  preservedArchivedObjectKey?: string;
}

export interface PublishOptions {
  refresh?: boolean;
  reportOnly?: boolean;
}

export interface PublishResult {
  reports: SurveyFileReport[];
  archivedObjectKeysWritten: string[];
  latestObjectKeysWritten: string[];
  manifest?: VersionManifest;
}

interface PreservedArchive {
  key: string;
  body: string;
}

interface PlannedSurveyFile {
  file: VersionedSurveyFile;
  state: SurveyFileState;
  preservedArchive?: PreservedArchive;
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

/**
 * Checks the existing remote pointer in S3 before overwriting it.
 * If the remote pointer carries a valid survey_version that lacks
 * an archive snapshot in S3, reports the snapshot that must be written first.
 */
async function findUnarchivedPointer(
  target: BucketTarget,
  latestObjectKey: string,
): Promise<PreservedArchive | undefined> {
  const pointerBody = await readObjectBody(target, latestObjectKey);

  if (!pointerBody) {
    return undefined;
  }

  const remoteVersion = readSurveyVersion(pointerBody);

  if (!remoteVersion) {
    return undefined;
  }

  const key = getArchiveKey(latestObjectKey, remoteVersion);

  if ((await readObjectBody(target, key)) !== undefined) {
    return undefined;
  }

  return { key, body: pointerBody };
}

async function planSurveyFile(
  target: BucketTarget,
  file: VersionedSurveyFile,
): Promise<PlannedSurveyFile> {
  const preservedArchive = await findUnarchivedPointer(target, file.latestObjectKey);
  const preservesIncomingKey = preservedArchive?.key === file.archivedObjectKey;

  const existingArchive = preservesIncomingKey
    ? preservedArchive?.body
    : await readObjectBody(target, file.archivedObjectKey);

  const state: SurveyFileState =
    existingArchive === undefined ? 'new' : existingArchive === file.body ? 'unchanged' : 'differs';

  return { file, state, preservedArchive };
}

async function planSurveyFiles(
  target: BucketTarget,
  files: VersionedSurveyFile[],
): Promise<PlannedSurveyFile[]> {
  const planned: PlannedSurveyFile[] = [];

  for (const file of files) {
    planned.push(await planSurveyFile(target, file));
  }

  return planned;
}

function toReport({ file, state, preservedArchive }: PlannedSurveyFile): SurveyFileReport {
  return {
    latestObjectKey: file.latestObjectKey,
    archivedObjectKey: file.archivedObjectKey,
    version: file.version,
    state,
    preservedArchivedObjectKey: preservedArchive?.key,
  };
}

function shouldWriteArchivedObject(state: SurveyFileState, refresh?: boolean): boolean {
  return state === 'new' || (state === 'differs' && Boolean(refresh));
}

export async function reportSurveyFiles(
  target: BucketTarget,
  files: SurveyFile[],
): Promise<SurveyFileReport[]> {
  const planned = await planSurveyFiles(target, resolveSurveyFiles(files));

  return planned.map(toReport);
}

export async function publishToCdn(
  target: BucketTarget,
  surveyDirectory: string,
  files: SurveyFile[],
  options: PublishOptions = {},
): Promise<PublishResult> {
  const resolved = resolveSurveyFiles(files);
  const planned = await planSurveyFiles(target, resolved);
  const reports = planned.map(toReport);

  if (options.reportOnly) {
    return { reports, archivedObjectKeysWritten: [], latestObjectKeysWritten: [] };
  }

  const archivedObjectKeysWritten: string[] = [];
  const latestObjectKeysWritten: string[] = [];
  const published: VersionedSurveyFile[] = [];

  for (const { file, state, preservedArchive } of planned) {
    if (preservedArchive) {
      await putObject(target, preservedArchive.key, preservedArchive.body);
      archivedObjectKeysWritten.push(preservedArchive.key);
    }

    if (shouldWriteArchivedObject(state, options.refresh)) {
      await putObject(target, file.archivedObjectKey, file.body);
      archivedObjectKeysWritten.push(file.archivedObjectKey);
    }

    await putObject(target, file.latestObjectKey, file.body);
    latestObjectKeysWritten.push(file.latestObjectKey);
    published.push(file);
  }

  const manifest = await writeVersionManifest(target, surveyDirectory, published);

  return { reports, archivedObjectKeysWritten, latestObjectKeysWritten, manifest };
}
