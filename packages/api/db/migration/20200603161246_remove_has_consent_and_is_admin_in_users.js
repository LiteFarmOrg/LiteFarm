/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (20200603161246_remove_has_consent_and_is_admin_in_users.js) is part of LiteFarm.
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

exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.dropColumn('is_admin');
      table.dropColumn('has_consent');
    }),
  ])
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.boolean('has_consent').defaultTo(false);
    }),
    // can't go back with is_admin
  ])
};
