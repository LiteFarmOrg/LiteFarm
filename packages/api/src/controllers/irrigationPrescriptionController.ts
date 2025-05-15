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
import { HttpError, ScopeCheckedLiteFarmRequest } from '../types.js';
import ESciAddon from '../util/ensembleService.js';
import { fakeIrrigationPrescriptions } from '../../tests/utils/ensembleUtils.js';
import FarmAddonModel from '../models/farmAddonModel.js';
import { AddonFunctions, IrrigationPrescription } from '../util/ensembleService.types.js';
import { customError } from '../util/customErrors.js';

export interface IrrigationPrescriptionQueryParams {
  startTime?: string;
  endTime?: string;
  shouldSend?: string;
}

// TODO: LF-4710 - Delete partner_id = 0, remove Partial
const PARTNER_ID_MAP: Record<string, Partial<AddonFunctions>> = {
  '0': {},
  '1': ESciAddon,
};

const irrigationPrescriptionController = {
  getPrescriptions() {
    return async (
      req: ScopeCheckedLiteFarmRequest<IrrigationPrescriptionQueryParams>,
      res: Response,
    ) => {
      try {
        const { farm_id } = req.headers;
        const { startTime, endTime, shouldSend } = req.query;
        if (
          typeof startTime != 'string' ||
          startTime != undefined ||
          typeof endTime != 'string' ||
          endTime != undefined ||
          typeof shouldSend != 'string' ||
          shouldSend != undefined
        ) {
          throw customError('Bad query param');
        }

        const irrigationPrescriptions: IrrigationPrescription[] = [];
        const partnerErrors: unknown[] = [];

        if (shouldSend === 'true') {
          // Check for registered farm addons (only esci for now)
          const farmAddonPartnerIds = await FarmAddonModel.getDistinctFarmAddonPartnerIds(farm_id);

          // Return empty array if no addons
          if (!farmAddonPartnerIds.length) {
            return res.status(200).send(irrigationPrescriptions);
          }

          // Loop through addon partners
          for (const farmAddonPartnerId of farmAddonPartnerIds) {
            try {
              const addonPartner = PARTNER_ID_MAP[farmAddonPartnerId.addon_partner_id.toString()];
              // TODO: LF-4710 - Skip deprecated partner_id = 0 situation
              // Type guard for undefined functions
              if (!addonPartner || typeof addonPartner.getIrrigationPrescriptions !== 'function') {
                continue;
              }

              irrigationPrescriptions.push(
                ...(await addonPartner.getIrrigationPrescriptions(farm_id, startTime, endTime)),
              );
            } catch (error) {
              partnerErrors.push(error);
            }
          }

          // Return an error if there are no prescriptions
          if (!irrigationPrescriptions.length && partnerErrors.length) {
            throw partnerErrors.shift();
          }
          return res.status(200).send(irrigationPrescriptions);
        } else {
          // Return data for dev purposes + QA
          const mockData = await fakeIrrigationPrescriptions({
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
