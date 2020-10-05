/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (20200629080929_migrate_user_to_userfarm.js) is part of LiteFarm.
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

exports.up = async function(knex) {
  await knex.raw(`
  UPDATE "userFarm" uf
  SET role_id = 
  (CASE 
  WHEN u.is_pseudo = true THEN 4
  ELSE uf.role_id
  END)
  FROM "users" u
  WHERE u.user_id = uf.user_id
  `);

  await knex.raw(`
  UPDATE "userFarm" uf
  SET wage = u.wage
  FROM "users" u
  WHERE u.user_id = uf.user_id
  `);
};

exports.down = function(knex) {

};