/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (20200602123113_migrate_user_data_to_userFarm.js) is part of LiteFarm.
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

exports.up = function (knex, Promise) {
  return Promise.all([
    knex.raw(
      `
      INSERT INTO "userFarm" (user_id, farm_id, has_consent, role_id, is_deleted)
      SELECT user_id, farm_id, has_consent, 
      (CASE 
      WHEN is_admin = true THEN 1
      ELSE 3
      END),
      (CASE 
      WHEN is_active = true THEN false
      ELSE true
      END)
      FROM "users" u
      WHERE u.farm_id IS NOT NULL
      `
    )
  ])
};

exports.down = function (knex, Promise) {

};
