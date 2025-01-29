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

import { ENSEMBLE_BRAND, getEnsembleOrganisations } from '../util/ensemble.js';

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
        return res.status(400).send('Organisation uuid required');
      }

      const allRegisteredOrganisations = await getEnsembleOrganisations();

      const organisation = allRegisteredOrganisations.find(({ uuid }) => uuid === org_uuid);

      if (!organisation) {
        return res.status(404).send('Organisation not found');
      }

      await FarmAddonModel.upsertFarmAddon({
        farm_id,
        addon_partner_id,
        org_uuid,
        org_pk: organisation.pk,
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
