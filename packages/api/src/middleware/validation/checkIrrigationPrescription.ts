/*
 *  Copyright (c) 2025 LiteFarm.org
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

import { Request, Response, NextFunction } from 'express';
import { isSimpleDateFormat } from '../../util/validation.js';

export interface IrrigationPrescriptionQueryParams {
  startTime?: string;
  endTime?: string;
  shouldSend?: string;
}

export function checkGetIrrigationPrescription() {
  return async (
    req: Request<unknown, unknown, unknown, IrrigationPrescriptionQueryParams>,
    res: Response,
    next: NextFunction,
  ) => {
    const { startTime, endTime, shouldSend } = req.query;

    if (shouldSend != 'true' && shouldSend != 'false') {
      return res.status(400).send('Please provide shouldSend as true or false');
    }

    if (!startTime || !isSimpleDateFormat(startTime)) {
      return res.status(400).send('Please provide startTime in YYYY-MM-DD format');
    }

    if (!endTime || !isSimpleDateFormat(endTime)) {
      return res.status(400).send('Please provide endTime in YYYY-MM-DD format');
    }

    next();
  };
}

export interface PrescriptionDetailsRouteParams {
  irrigationPrescriptionId: number;
}

export type PrescriptionDetailsQueryParams = Record<string, never>;

export function checkGetPrescriptionDetails() {
  return async (
    req: Request<PrescriptionDetailsRouteParams, unknown, unknown, PrescriptionDetailsQueryParams>,
    res: Response,
    next: NextFunction,
  ) => {
    const { irrigationPrescriptionId } = req.params;

    if (!Number.isInteger(Number(irrigationPrescriptionId))) {
      return res.status(400).send('Prescription ID must be an integer');
    }

    next();
  };
}
