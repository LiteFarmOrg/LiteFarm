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

import FarmAddonModel from '../models/farmAddonModel.js';
import { getValidEnsembleOrg } from '../util/ensemble.js';

const farmAddonController = {
  addFarmAddon() {
    return async (req, res) => {
      const { org_uuid } = req.body;

      try {
        const organisation = await getValidEnsembleOrg(org_uuid);

        if (!organisation) {
          return res.status(404).send('Organisation not found');
        }

        await FarmAddonModel.upsertFarmAddon({
          req,
          org_pk: organisation.pk,
        });

        return res.status(200).send();
      } catch (error) {
        console.error(error);
        return res.status(error.status || 400).json({
          error: error.message || error,
        });
      }
    };
  },
  getFarmAddon() {
    return async (req, res) => {
      try {
        const { farm_id } = req.headers;
        const { addon_partner_id } = req.query;
        const rows = await FarmAddonModel.query()
          .where({ farm_id, addon_partner_id })
          .skipUndefined()
          .whereNotDeleted();
        if (!rows.length) {
          return res.sendStatus(404);
        }
        const result = rows.map(({ addon_partner_id, org_uuid }) => {
          return { addon_partner_id, org_uuid };
        });
        return res.status(200).send(result);
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          error,
        });
      }
    };
  },
};

export default farmAddonController;
