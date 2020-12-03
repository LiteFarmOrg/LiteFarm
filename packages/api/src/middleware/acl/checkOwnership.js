/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (checkOwnership.js) is part of LiteFarm.
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

// relation must be one of field, plan, farmExpense, farmCrop, or to do
const checkOwnership = (relation) => {
  return async function authRelation(req, res, next) {
    const knex = Model.knex();
    const id = req.params.id;
    if (id) {
      let sqlQuery;
      // console.log(farm_id);
      // user id is contained in attribute sub in this format: 'auth0|5b0560215d7d1617fd7ed217'
      const user_id = req.user.user_id
      // console.log(`check ${relation}_id`, user_id, id);

      switch (relation) {
      case 'shift':
      case 'log':
      case 'notification':
        sqlQuery = `SELECT DISTINCT u.user_id
        FROM "${relation}" r, "users" u
        WHERE u.user_id = '${user_id}' AND r.${relation}_id = '${id}' AND u.user_id = r.user_id`;
        break;
      case 'sale':
        sqlQuery = `SELECT DISTINCT u.user_id
        FROM "${relation}" s, "users" u
        WHERE u.user_id = '${user_id}' AND s.${relation}_id = '${id}' AND u.farm_id = s.farm_id`;
        break;
      case 'fieldCrop':
        sqlQuery = `SELECT DISTINCT u.user_id
        FROM "${relation}" r, "users" u, "field" f
        WHERE u.user_id = '${user_id}' AND r.field_crop_id = '${id}' AND f.field_id = r.field_id AND f.farm_id = u.farm_id`;
        break;
      case 'nitrogenSchedule':
        sqlQuery = `SELECT DISTINCT u.user_id
        FROM "${relation}" r, "users" u
        WHERE u.user_id = '${user_id}' AND r.nitrogen_schedule_id = '${id}' AND u.farm_id = r.farm_id`;
        break;
        //TODO potential bug
      default:
        sqlQuery = `SELECT DISTINCT u.user_id
        FROM ? r, "users" u
        WHERE u.user_id = ? AND r.?_id = ? AND u.farm_id = r.farm_id`;
      }

      const verified = await knex.raw(sqlQuery, [relation, user_id, relation, id]);
      if (verified.rowCount) {
        next();
      } else {
        // console.log('failed in check ownership');
        res.status(401).send(`user not authorized to access ${relation} with specified ${relation}_id`);
      }
    } else {
      next();
    }
  };
};

module.exports = checkOwnership;
