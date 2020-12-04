/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (authFarmId.js) is part of LiteFarm.
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

const { Model } = require('objection');

async function authFarmId(req, res, next) {
  const knex = Model.knex();
  const farm_id = req.params.farm_id;
  if (farm_id) {
    // console.log(farm_id);
    // user id is contained in attribute sub in this format: 'auth0|5b0560215d7d1617fd7ed217'
    const user_id = req.user.user_id
    // console.log("check farm_id", user_id, farm_id);
    const farms = await knex.raw(`SELECT uf.farm_id
      FROM "userFarm" uf
      WHERE uf.user_id = ?`, [user_id]);

    if (farms && farms.rows.length) {
      let is_found = false;
      for(const f of farms.rows){
        if(f.farm_id === farm_id){
          is_found = true;
          next();
        }
      }
      if(!is_found){
        res.status(401).send('user not authorized to access farm with specified farm_id');
      }
    } else {
      // console.log('failed in authFarmId: ', user_id, farm_id);
      res.status(401).send('user not authorized to access farm with specified farm_id');
    }
  } else {
    next();
  }
}

module.exports = authFarmId;
