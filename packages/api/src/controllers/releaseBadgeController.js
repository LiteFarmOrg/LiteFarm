/*
 *  Copyright 2023 LiteFarm.org
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

import ReleaseBadgeModel from '../models/releaseBadgeModel.js';

const releaseBadgeController = {
  getReleaseBadgeVersion() {
    return async (req, res) => {
      try {
        const { user_id } = req.auth;
        const record = await ReleaseBadgeModel.query().findById(user_id);

        if (record) {
          res.json({ app_version: record.app_version });
        } else {
          res.json({ app_version: null });
        }
      } catch (error) {
        console.error(error);
        res.status(400).json({ error });
      }
    };
  },
  updateReleaseBadgeVersion() {
    return async (req, res) => {
      try {
        const { user_id } = req.auth;
        const { app_version } = req.body;
        const existingVersion = await ReleaseBadgeModel.query().findById(user_id);

        if (existingVersion) {
          await ReleaseBadgeModel.query()
            .findById(user_id)
            .patch({ app_version })
            .context({ user_id });
        } else {
          await ReleaseBadgeModel.query()
            .insert({
              user_id,
              app_version,
            })
            .context({ user_id });
        }

        res.sendStatus(200);
      } catch (error) {
        console.error(error);
        res.status(400).json({ error });
      }
    };
  },
};

export default releaseBadgeController;
