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

import { S3Client } from '@aws-sdk/client-s3';
import { DO_ENDPOINT } from '../../src/util/digitalOceanSpaces.js';

export const RELEASE_ENVIRONMENTS = ['development', 'integration', 'production'] as const;

export type ReleaseEnvironment = (typeof RELEASE_ENVIRONMENTS)[number];

const BUCKET_BY_ENVIRONMENT: Record<ReleaseEnvironment, string> = {
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
  environment: ReleaseEnvironment;
  bucket: string;
  client: S3Client;
}

function isReleaseEnvironment(value: string): value is ReleaseEnvironment {
  return (RELEASE_ENVIRONMENTS as readonly string[]).includes(value);
}

export function resolveBucketTarget(environment: string): BucketTarget {
  if (!isReleaseEnvironment(environment)) {
    throw new Error(
      `Unknown release environment "${environment}". Expected one of: ${RELEASE_ENVIRONMENTS.join(
        ', ',
      )}.`,
    );
  }

  const accessKeyId = process.env.DO_SPACES_ACCESS_KEY_ID;
  const secretAccessKey = process.env.DO_SPACES_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      'DO_SPACES_ACCESS_KEY_ID and DO_SPACES_SECRET_ACCESS_KEY must both be set to run a release.',
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
