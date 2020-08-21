/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (checkEditPrivilege.js) is part of LiteFarm.
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

const checkEditPrivilege = () => {

  return async (req, res, next) => {
    const knex = Model.knex();
    const farm_id = req.params.farm_id;
    const edit_user_id = req.params.user_id;
    const request_user_id = req.user.sub.split('|')[1];
    const ALLOWED_ROLES = [1, 2];
    if (farm_id) {
      // console.log(farm_id);
      // user id is contained in attribute sub in this format: 'auth0|5b0560215d7d1617fd7ed217'
      const farms = await knex.raw(`SELECT *
      FROM "userFarm" uf
      WHERE uf.user_id = '${request_user_id}'  AND uf.farm_id = '${farm_id}' `);

      if(!farms || !farms.rows.length) {
        return res.status(401).send('user not authorized to access farm with specified farm_id').end();
      }
      const farmInWhichUserIs = farms.rows.find((farm) => farm.farm_id === farm_id);
      if(!farmInWhichUserIs) {
        return res.status(401).send('user not authorized to access farm with specified farm_id').end();
      }
      if(!ALLOWED_ROLES.includes(farmInWhichUserIs.role_id)) {
        return res.status(401).send('user not authorized to edit user').end();
      }
    }

    if (edit_user_id) {
      const userRow = await knex.raw(
        `SELECT *
      FROM "userFarm" uf
      WHERE uf.user_id = '${edit_user_id}'
      AND uf.farm_id = '${farm_id}'
      `
      );

      if (userRow && userRow.rows && userRow.rows.length) {
        const payload = req.body;
        if (payload.first_name && payload.first_name.toString().length > 0){
          return res.status(403).send('First name may not be modified').end();
        }
        if (payload.last_name && payload.last_name.toString().length > 0){
          return res.status(403).send('Last name may not be modified').end();
        }

        if (req.body && req.body.email && req.body.email.length > 0 && !req.body.email_needs_update){
          return res.status(403).send('Email may not be modified').end();
        }

        if(req.body && req.body.email && userRow.rows[0].role_id && userRow.rows[0].role_id !== 4){
          return res.status(403).send('Email may not be modified').end();
        }

        if (payload.wage && payload.wage.amount && (Number(payload.wage.amount) < 0 || Number(payload.wage.amount) > 999999999999.99)){
          return res.status(403).send('Wage must be a valid, non-negative decimal').end();
        }
        if (payload.wage && payload.wage.type && payload.wage.type !== 'hourly') {
          return res.status(403).send('Wage type must be Hourly for this version.').end();
        }
        next();
      } else {
        return res.status(404).send('User to be edited not found').end();
      }
    }
  }

};

module.exports = checkEditPrivilege;
