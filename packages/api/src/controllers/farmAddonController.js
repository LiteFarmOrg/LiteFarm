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

import AddonPartnerModel from '../models/addonPartnerModel.js';
import FarmAddonModel from '../models/farmAddonModel.js';

import { ENSEMBLE_BRAND, getEnsembleOrganizations } from '../util/ensemble.js';

const farmAddonController = {
  async addFarmAddon(req, res) {
    const { farm_id } = req.headers;
    const { addon_partner_id, org_uuid } = req.body;

    try {
      const { id: EnsemblePartnerId } = await AddonPartnerModel.getPartnerId(ENSEMBLE_BRAND);

      if (addon_partner_id !== EnsemblePartnerId) {
        return res.status(400).send('Only Ensemble Scientific is supported');
      }

      if (!org_uuid || !org_uuid.length) {
        return res.status(400).send('Organization uuid required');
      }

      const { access_token } = await AddonPartnerModel.getAccessAndRefreshTokens(ENSEMBLE_BRAND);

      const allRegisteredOrganizations = await getEnsembleOrganizations(access_token);

      const organization = allRegisteredOrganizations.find(({ uuid }) => uuid === org_uuid);

      if (!organization) {
        return res.status(404).send('Organization not found');
      }

      await FarmAddonModel.upsertFarmAddon({
        farm_id,
        addon_partner_id,
        org_uuid,
        org_pk: organization.pk,
      });

      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        error,
      });
    }
  },
};

export default farmAddonController;
