/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (202006151420_update_is_deleted_to_enum.js) is part of LiteFarm.
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

exports.up = async function (knex, Promise) {
  return Promise.all([
    await knex.schema.table('userFarm', (table) => {
      table.enu('status', ['Active', 'Inactive', 'Invited']);
    }),
    await knex.raw(
      `
        UPDATE "userFarm"
        SET status = (CASE WHEN is_deleted = false
                           THEN 'Active'
                           ELSE 'Inactive'
                      END)
      `
    ),
    await knex.schema.table('userFarm', (table) => {
      table.dropColumn('is_deleted');
    }),
  ])
};

exports.down = async function (knex, Promise) {
  return Promise.all([
    await knex.schema.table('userFarm', (table) => {
      table.boolean('is_deleted').notNullable().defaultTo(false);
    }),
    await knex.raw(
      `
        UPDATE "userFarm"
        SET is_deleted = (CASE WHEN status = 'Active'
                               THEN false
                               ELSE true
                          END)
      `
    ),
    await knex.schema.table('userFarm', (table) => {
      table.dropColumn('status');
    }),
  ])
};
