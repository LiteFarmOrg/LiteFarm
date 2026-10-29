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

import { NextFunction, Response } from 'express';
import { ErrorHash, ValidationError } from 'objection';
import { validate as isUuid } from 'uuid';
import LocationModel from '../../models/locationModel.js';
import SoilLabResultModel from '../../models/soilLabResultModel.js';
import { BaseProperties, SoilLabResult } from '../../models/types.js';
import { HttpError, LiteFarmRequest } from '../../types.js';
import { checkAndTrimString } from '../../util/util.js';
import { isSimpleDateFormat } from '../../util/validation.js';

export interface SoilLabResultSample {
  row: number;
  sample_label?: string | null;
  location_id: string;
  match_method: string;
  sampled_on?: string | null;
  depth_top_cm: number;
  depth_bottom_cm: number;
  depth_assumed: boolean;
  lat?: number | null;
  lng?: number | null;
  values: Record<string, number>;
}

export interface SoilLabResultBody {
  submission_id: string;
  lab_name?: string | null;
  source_filename: string;
  source_sha256: string;
  samples: SoilLabResultSample[];
}

export type SoilLabResultRow = Omit<SoilLabResult, 'id' | keyof BaseProperties>;

export interface SoilLabResultParams {
  submission_id: string;
}

interface RowError {
  row?: number;
  message: string;
}

const getLatestAllowedSampleDate = () => {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
};

const getBatchError = ({
  submission_id,
  lab_name,
  source_filename,
  source_sha256,
  samples,
}: Partial<SoilLabResultBody>) => {
  if (!isUuid(submission_id as string)) {
    return 'submission_id must be a uuid';
  }
  if (lab_name != null && typeof lab_name !== 'string') {
    return 'lab_name must be a string or null';
  }
  if (!checkAndTrimString(source_filename)) {
    return 'source_filename is required';
  }
  if (!checkAndTrimString(source_sha256)) {
    return 'source_sha256 is required';
  }
  if (!Array.isArray(samples) || !samples.length) {
    return 'samples must be a non-empty array';
  }
  return null;
};

const mapSampleToSoilLabResult = (
  sample: SoilLabResultSample,
  body: SoilLabResultBody,
  farm_id: string,
): SoilLabResultRow => ({
  farm_id,
  submission_id: body.submission_id,
  row: sample.row,
  location_id: sample.location_id,
  match_method: sample.match_method,
  sample_label: sample.sample_label ?? null,
  sampled_on: sample.sampled_on ?? null,
  depth_top_cm: sample.depth_top_cm,
  depth_bottom_cm: sample.depth_bottom_cm,
  depth_assumed: sample.depth_assumed,
  lat: sample.lat ?? null,
  lng: sample.lng ?? null,
  values: sample.values,
  lab_name: body.lab_name ?? null,
  source_filename: body.source_filename,
  source_sha256: body.source_sha256,
});

const getSampleErrors = (result: SoilLabResultRow, latestAllowedDate: string) => {
  const messages: string[] = [];
  try {
    // Validated against the model's jsonSchema here, in addition to at insert,
    // because insert-time validation would return only the first bad sample, and the
    // dashboard requests per-row errors ({ row, message })
    /* @ts-expect-error known issue with models */
    SoilLabResultModel.fromJson(result);
  } catch (error) {
    if (!(error instanceof ValidationError)) {
      throw error;
    }
    const issuesByField: ErrorHash = error.data;
    for (const [field, issues] of Object.entries(issuesByField)) {
      messages.push(...issues.map(({ message }) => `${field} ${message}`));
    }
  }
  if (result.depth_top_cm >= result.depth_bottom_cm) {
    messages.push('depth_top_cm must be less than depth_bottom_cm');
  }
  if (isSimpleDateFormat(result.sampled_on) && result.sampled_on! > latestAllowedDate) {
    messages.push('sampled_on must not be in the future');
  }
  return messages;
};

const getLocationErrors = async (results: SoilLabResultRow[], farm_id: string) => {
  const locationIds = [...new Set(results.map(({ location_id }) => location_id))];

  /* @ts-expect-error known issue with models */
  const locations: { location_id: string }[] = await LocationModel.query()
    .whereNotDeleted()
    .where({ farm_id })
    .whereIn('location_id', locationIds)
    .select('location_id');

  const farmLocationIds = locations.map(({ location_id }) => location_id);

  const locationErrors = results
    .filter(({ location_id }) => !farmLocationIds.includes(location_id))
    .map(({ row }) => ({ row, message: 'location_id is not a location on this farm' }));

  return locationErrors;
};

export function checkSubmissionIdMatchesUrl() {
  return (
    req: LiteFarmRequest<unknown, SoilLabResultParams, unknown, Partial<SoilLabResultBody>>,
    res: Response,
    next: NextFunction,
  ) => {
    if (req.body.submission_id !== req.params.submission_id) {
      return res
        .status(400)
        .json({ errors: [{ message: 'submission_id in the body must match the URL' }] });
    }
    next();
  };
}

export function checkSoilLabResultBatch() {
  return async (
    req: LiteFarmRequest<unknown, unknown, unknown, Partial<SoilLabResultBody>>,
    res: Response,
    next: NextFunction,
  ) => {
    const farm_id = req.headers.farm_id!;

    const batchError = getBatchError(req.body);
    if (batchError) {
      return res.status(400).json({ errors: [{ message: batchError }] });
    }

    const body = req.body as SoilLabResultBody;
    const latestAllowedDate = getLatestAllowedSampleDate();
    const seenRows = new Set<number>();
    const errors: RowError[] = [];
    const results: SoilLabResultRow[] = [];

    try {
      for (const [index, sample] of body.samples.entries()) {
        if (!Number.isInteger(sample?.row)) {
          errors.push({ message: `samples[${index}] must have an integer row` });
          continue;
        }
        if (seenRows.has(sample.row)) {
          errors.push({ row: sample.row, message: 'row appears more than once in samples' });
        }
        seenRows.add(sample.row);

        const result = mapSampleToSoilLabResult(sample, body, farm_id);

        errors.push(
          ...getSampleErrors(result, latestAllowedDate).map((message) => ({
            row: sample.row,
            message,
          })),
        );
        results.push(result);
      }

      if (errors.length) {
        return res.status(400).json({ errors });
      }

      const locationErrors = await getLocationErrors(results, farm_id);
      if (locationErrors.length) {
        return res.status(400).json({ errors: locationErrors });
      }

      res.locals.soilLabResults = results;
      next();
    } catch (error: unknown) {
      console.error(error);
      const err = error as HttpError;
      const status = err.status || err.code || 500;
      return res.status(status).json({ error: err.message || err });
    }
  };
}
