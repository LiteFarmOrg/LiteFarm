/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
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


const organicHistoryModel = require('../models/organicHistoryModel');

module.exports = {

  addOrganicHistory() {
    return async (req, res) => {
      try {
        const result = await organicHistoryModel.query().context(req.user).insert(req.body);
        return res.status(201).send(result);
      } catch (error) {
        return res.status(400).json({ error });
      }
    };
  },

  async getOrganicHistory(req, res) {
    try {
      const result = await organicHistoryModel.query().where({ location_id: req.params.location_id });
      return res.status(200).send(result);
    } catch (error) {
      return res.status(400).json({ error });
    }
  },

};
