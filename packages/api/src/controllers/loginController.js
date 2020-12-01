/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (createUserController.js) is part of LiteFarm.
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
const baseController = require('../controllers/baseController');
const userModel = require('../models/userModel');
const userFarmModel = require('../models/userFarmModel');


class loginController extends baseController {
  static loginWithGoogle() {
    return async (req, res) => {
      try {
        const { sub: user_id, email, given_name: first_name, family_name: last_name } = req.body;
        const user = await userModel.query().findById(user_id);
        let userFarms = [];
        if (!user) {
          const newUser = { user_id, email, first_name, last_name };
          await userModel.query().insert(newUser);
        } else {
          userFarms = await userFarmModel.query().select('*').where('userFarm.user_id', user_id)
            .leftJoin('role', 'userFarm.role_id', 'role.role_id')
            .leftJoin('users', 'userFarm.user_id', 'users.user_id')
            .leftJoin('farm', 'userFarm.farm_id', 'farm.farm_id');
        }
        return res.status(201).send(userFarms);
      } catch (err) {
        throw 'Fail to login';
      }
    }

  }
}

module.exports = loginController;
