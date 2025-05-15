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
import { isISO8601Format } from '../../util/validation.js';
import { IrrigationPrescriptionQueryParams } from '../../controllers/irrigationPrescriptionController.js';

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

    if (!startTime || !isISO8601Format(startTime)) {
      return res.status(400).send('Please provide startTime in ISO 8601 format');
    }

    if (!endTime || !isISO8601Format(endTime)) {
      return res.status(400).send('Please provide endTime in ISO 8601 format');
    }

    next();
  };
}
