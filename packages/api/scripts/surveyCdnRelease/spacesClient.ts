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

import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { DO_ENDPOINT } from '../../src/util/digitalOceanSpaces.js';

export const PUBLISH_ENVIRONMENTS = ['development', 'integration', 'production'] as const;
export type PublishEnvironment = (typeof PUBLISH_ENVIRONMENTS)[number];

export const TAPE_SURVEYS_DIRECTORY = 'tape_surveys';

const BUCKET_BY_ENVIRONMENT: Record<PublishEnvironment, string> = {
  development: 'litefarm',
  integration: 'litefarmbeta',
  production: 'litefarmapp',
};

export const OBJECT_WRITE_DEFAULTS = {
  ACL: 'public-read',
  ContentType: 'application/json',
  CacheControl: 'no-cache',
} as const;

export interface BucketTarget {
  environment: PublishEnvironment;
  bucket: string;
  client: S3Client;
}

function isPublishEnvironment(value: string): value is PublishEnvironment {
  return (PUBLISH_ENVIRONMENTS as readonly string[]).includes(value);
}

export function resolveBucketTarget(environment: string): BucketTarget {
  if (!isPublishEnvironment(environment)) {
    throw new Error(
      `Unknown publish environment "${environment}". Expected one of: ${PUBLISH_ENVIRONMENTS.join(
        ', ',
      )}.`,
    );
  }

  const accessKeyId = process.env.SURVEY_CDN_ACCESS_KEY_ID;
  const secretAccessKey = process.env.SURVEY_CDN_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      'SURVEY_CDN_ACCESS_KEY_ID and SURVEY_CDN_SECRET_ACCESS_KEY must both be set to publish.',
    );
  }

  return {
    environment,
    bucket: BUCKET_BY_ENVIRONMENT[environment],
    client: new S3Client({
      endpoint: `https://${DO_ENDPOINT}`,
      region: 'us-east-1',
      credentials: { accessKeyId, secretAccessKey },
    }),
  };
}

export function isMissingObject(error: unknown): boolean {
  const { name, $metadata } = (error ?? {}) as {
    name?: string;
    $metadata?: { httpStatusCode?: number };
  };

  return name === 'NoSuchKey' || $metadata?.httpStatusCode === 404;
}

export async function readObjectBody(
  target: BucketTarget,
  key: string,
): Promise<string | undefined> {
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

export async function putObject(target: BucketTarget, key: string, body: string): Promise<void> {
  await target.client.send(
    new PutObjectCommand({
      ...OBJECT_WRITE_DEFAULTS,
      Bucket: target.bucket,
      Key: key,
      Body: body,
    }),
  );
}

export async function listObjectKeys(
  target: BucketTarget,
  prefix: string = `${TAPE_SURVEYS_DIRECTORY}/`,
): Promise<string[]> {
  const objectKeys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await target.client.send(
      new ListObjectsV2Command({
        Bucket: target.bucket,
        Prefix: prefix,
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
