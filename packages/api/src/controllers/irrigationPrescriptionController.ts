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
import { LiteFarmRequest, HttpError } from '../types.js';
import { fakeIrrigationPrescriptions } from '../../tests/utils/ensembleUtils.js';
import { IrrigationPrescriptionQueryParams } from '../middleware/validation/checkIrrigationPrescription.js';
import { getAddonPartnerIrrigationPrescriptions } from '../services/addonPartner.js';

const irrigationPrescriptionController = {
  getPrescriptions() {
    return async (
      req: LiteFarmRequest<Required<IrrigationPrescriptionQueryParams>>,
      res: Response,
    ) => {
      try {
        const { farm_id } = req.headers;
        const { startTime, endTime, shouldSend } = req.query;

        if (shouldSend === 'true') {
          // @ts-expect-error - farm_id is guaranteed here by the checkScope middleware with single argument
          const irrigationPrescriptions = await getAddonPartnerIrrigationPrescriptions(farm_id);
          return res.status(200).send(irrigationPrescriptions);
        } else {
          // Return data for dev purposes + QA
          const mockData = await fakeIrrigationPrescriptions({
            // @ts-expect-error - farm_id is guaranteed here by the checkScope middleware with single argument
            farmId: farm_id,
            startTime,
            endTime,
          });
          return res.status(200).send(mockData);
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

export default irrigationPrescriptionController;
