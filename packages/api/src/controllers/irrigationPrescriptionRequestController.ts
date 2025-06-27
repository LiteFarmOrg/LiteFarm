/*
 *  Copyright 2025 LiteFarm.org
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

import { Response } from 'express';
import {
  getOrgLocationAndCropData,
  sendAllFieldAndCropDataToEsci,
} from '../util/ensembleService.js';
import { LiteFarmRequest } from '../types.js';

interface HttpError extends Error {
  status?: number;
  code?: number; // LF custom error
}

interface InitiateFarmIrrigationPrescriptionQueryParams {
  allOrgs?: string;
  shouldSend?: string;
}

const irrigationPrescriptionRequestController = {
  initiateFarmIrrigationPrescription() {
    return async (
      req: LiteFarmRequest<InitiateFarmIrrigationPrescriptionQueryParams>,
      res: Response,
    ) => {
      const { farm_id } = req.headers;
      const { allOrgs, shouldSend } = req.query;

      try {
        const allFarmData = await getOrgLocationAndCropData(
          allOrgs === 'true' ? undefined : farm_id,
        );

        if (shouldSend === 'true') {
          const results = await sendAllFieldAndCropDataToEsci(allFarmData);

          const errorCount = results.filter((result) => result.status === 'error').length;
          const statusCode = !errorCount ? 200 : errorCount === results.length ? 502 : 207;

          return res.status(statusCode).send(results);
        } else {
          // Return data for dev purposes + QA
          return res.status(200).send(allFarmData);
        }
      } catch (error: unknown) {
        console.error(error);

        const err = error as HttpError;
        const status = err.status || err.code || 500;
        return res.status(status).json({
          error: err.message || err,
        });
      }
    };
  },
};

export default irrigationPrescriptionRequestController;
