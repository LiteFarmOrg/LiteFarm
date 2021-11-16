/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (userFarmController.js) is part of LiteFarm.
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


const userFarmModel = require('../models/userFarmModel');

const { createToken } = require('../util/jwt');


const farmTokenController = {

  getFarmToken() {
    return async (req, res) => {
      const { farm_id } = req.params;
      const { user_id } = req.user;
      const userFarm = await userFarmModel.query().findById([user_id, farm_id]);
      if (!userFarm) return res.sendStatus(404);
      const farm_token = createToken('farm', { user_id, farm_id, role_id: userFarm?.role_id });
      return res.status(200).send({ farm_token });
    };
  },
};

module.exports = farmTokenController;
