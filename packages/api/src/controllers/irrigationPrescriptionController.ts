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
import { getEsciPrescriptions } from '../util/ensembleService.js';
import { fakeIrrigationPrescriptions } from '../../tests/utils/ensembleUtils.js';

interface DELETEMEQueryParams {
  after_date?: string;
  shouldSend?: string;
}

const irrigationPrescriptionController = {
  getPrescriptions() {
    return async (req: LiteFarmRequest<DELETEMEQueryParams>, res: Response) => {
      try {
        const { farm_id } = req.headers;
        const { after_date, shouldSend } = req.query;

        if (shouldSend === 'true') {
          // @ts-expect-error - farm_id is guaranteed here by the checkScope middleware with single argument
          const prescriptions = await getEsciPrescriptions(farm_id, after_date);
          return res.status(200).send(prescriptions);
        } else {
          // Return data for dev purposes + QA
          const mockData = await fakeIrrigationPrescriptions(
            // @ts-expect-error - farm_id is guaranteed here by the checkScope middleware with single argument
            farm_id,
            [1, 2],
            undefined,
            after_date,
          );
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
