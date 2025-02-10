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

import { validate } from 'uuid';
import AddonPartnerModel from '../../models/addonPartnerModel.js';
import { ENSEMBLE_BRAND } from '../../util/ensemble.js';

export function checkFarmAddon() {
  return async (req, res, next) => {
    try {
      const { addon_partner_id, org_uuid } = req.body;

      if (!org_uuid || !org_uuid.length) {
        return res.status(400).send('org_uuid required');
      }

      if (!validate(org_uuid)) {
        return res.status(400).send('org_uuid invalid');
      }

      const { id: EnsemblePartnerId } = await AddonPartnerModel.getPartnerId(ENSEMBLE_BRAND);

      if (addon_partner_id !== EnsemblePartnerId) {
        return res.status(400).send('Only Ensemble Scientific is supported');
      }

      next();
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        error,
      });
    }
  };
}
