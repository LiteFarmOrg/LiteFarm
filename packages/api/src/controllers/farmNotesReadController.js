/*
 *  Copyright 2026 LiteFarm.org
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

import FarmNotesReadModel from '../models/farmNotesReadModel.js';

const farmNotesReadController = {
  getFarmNotesRead() {
    return async (req, res) => {
      try {
        const { user_id } = req.auth;
        const { farm_id } = req.headers;

        const row = await FarmNotesReadModel.query().where({ user_id, farm_id }).first();

        return res.status(200).json({ last_read_at: row ? row.last_read_at : null });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },

  markFarmNotesRead() {
    return async (req, res) => {
      try {
        const { user_id } = req.auth;
        const { farm_id } = req.headers;
        const last_read_at = new Date().toISOString();

        const existing = await FarmNotesReadModel.query().where({ user_id, farm_id }).first();

        if (existing) {
          await FarmNotesReadModel.query()
            .context({ user_id })
            .patch({ last_read_at })
            .where({ user_id, farm_id });
        } else {
          await FarmNotesReadModel.query()
            .context({ user_id })
            .insert({ user_id, farm_id, last_read_at });
        }

        return res.status(204).send();
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },
};

export default farmNotesReadController;
