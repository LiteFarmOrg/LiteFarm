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

import { Request, Response } from 'express';
import { sendIrrigationData } from '../util/ensembleService.js';

interface HttpError extends Error {
  status?: number;
  code?: number; // LF custom error
}

export interface LiteFarmRequest extends Request {
  headers: Request['headers'] & {
    farm_id?: string;
  };
}

const irrigationPrescriptionController = {
  initiateFarmIrrigationPrescription() {
    return async (req: LiteFarmRequest, res: Response) => {
      const { farm_id } = req.headers;

      try {
        const farmData = await sendIrrigationData(farm_id);

        // temporarily returning data just for debugging
        return res.status(200).send(farmData);
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
