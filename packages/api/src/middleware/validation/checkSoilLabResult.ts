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
import { ValidationError } from 'objection';
import { validate as isUuid } from 'uuid';
import LocationModel from '../../models/locationModel.js';
import SoilLabResultModel from '../../models/soilLabResultModel.js';
import { LiteFarmRequest } from '../../types.js';

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

export interface SoilLabResultRow extends SoilLabResultSample {
  farm_id: string;
  submission_id: string;
  lab_name: string | null;
  source_filename: string;
  source_sha256: string;
}

export interface SoilLabResultParams {
  submission_id?: string;
}

interface RowError {
  row?: number;
  message: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const isNonEmptyString = (value: unknown) => typeof value === 'string' && value.trim().length > 0;

const getLatestAllowedSampleDate = () => {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
};

const getBatchErrors = (body: Partial<SoilLabResultBody>, params: SoilLabResultParams) => {
  const errors: string[] = [];
  if (typeof body.submission_id !== 'string' || !isUuid(body.submission_id)) {
    errors.push('submission_id must be a uuid');
  } else if (params.submission_id !== undefined && params.submission_id !== body.submission_id) {
    errors.push('submission_id in the body must match the URL');
  }
  if (body.lab_name != null && typeof body.lab_name !== 'string') {
    errors.push('lab_name must be a string or null');
  }
  if (!isNonEmptyString(body.source_filename)) {
    errors.push('source_filename is required');
  }
  if (!isNonEmptyString(body.source_sha256)) {
    errors.push('source_sha256 is required');
  }
  if (!Array.isArray(body.samples) || !body.samples.length) {
    errors.push('samples must be a non-empty array');
  }
  return errors;
};

const toRow = (
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

const getRowErrors = (row: SoilLabResultRow, latestAllowedDate: string) => {
  const messages: string[] = [];
  try {
    /* @ts-expect-error known issue with models */
    SoilLabResultModel.fromJson(row);
  } catch (error) {
    if (!(error instanceof ValidationError)) {
      throw error;
    }
    for (const [field, issues] of Object.entries(
      error.data as Record<string, { message: string }[]>,
    )) {
      messages.push(...issues.map(({ message }) => `${field} ${message}`));
    }
  }
  if (row.depth_top_cm >= row.depth_bottom_cm) {
    messages.push('depth_top_cm must be less than depth_bottom_cm');
  }
  if (row.sampled_on && ISO_DATE.test(row.sampled_on) && row.sampled_on > latestAllowedDate) {
    messages.push('sampled_on must not be in the future');
  }
  return messages;
};

const getLocationErrors = async (rows: SoilLabResultRow[], farm_id: string) => {
  const locationIds = [...new Set(rows.map(({ location_id }) => location_id))];
  /* @ts-expect-error known issue with models */
  const locations: { location_id: string }[] = await LocationModel.query()
    .whereNotDeleted()
    .where({ farm_id })
    .whereIn('location_id', locationIds)
    .select('location_id');
  const farmLocationIds = new Set(locations.map(({ location_id }) => location_id));
  return rows
    .filter(({ location_id }) => !farmLocationIds.has(location_id))
    .map(({ row }) => ({ row, message: 'location_id is not a location on this farm' }));
};

export function checkSoilLabResultBatch() {
  return async (
    req: LiteFarmRequest<unknown, SoilLabResultParams, unknown, Partial<SoilLabResultBody>>,
    res: Response,
    next: NextFunction,
  ) => {
    const farm_id = req.headers.farm_id!;

    const batchErrors = getBatchErrors(req.body, req.params);
    if (batchErrors.length) {
      return res.status(400).json({ errors: batchErrors.map((message) => ({ message })) });
    }

    const body = req.body as SoilLabResultBody;
    const latestAllowedDate = getLatestAllowedSampleDate();
    const seenRows = new Set<number>();
    const errors: RowError[] = [];
    const rows: SoilLabResultRow[] = [];

    try {
      body.samples.forEach((sample, index) => {
        if (typeof sample !== 'object' || sample === null || !Number.isInteger(sample.row)) {
          errors.push({ message: `samples[${index}] must be an object with an integer row` });
          return;
        }
        if (seenRows.has(sample.row)) {
          errors.push({ row: sample.row, message: 'row appears more than once in samples' });
        }
        seenRows.add(sample.row);

        const row = toRow(sample, body, farm_id);
        errors.push(
          ...getRowErrors(row, latestAllowedDate).map((message) => ({ row: sample.row, message })),
        );
        rows.push(row);
      });

      if (errors.length) {
        return res.status(400).json({ errors });
      }

      const locationErrors = await getLocationErrors(rows, farm_id);
      if (locationErrors.length) {
        return res.status(400).json({ errors: locationErrors });
      }

      res.locals.soilLabResultRows = rows;
      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error });
    }
  };
}
