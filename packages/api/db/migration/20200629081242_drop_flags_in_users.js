/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (20200629081242_drop_flags_in_users.js) is part of LiteFarm.
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
      table.dropColumn('is_pseudo');
      table.dropColumn('is_active');
      table.dropColumn('wage');
    }),
  ])
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.boolean('is_active').notNullable().defaultTo(true);
      table.boolean('is_pseudo').notNullable().defaultTo(false);
      table.jsonb('wage').defaultTo(JSON.stringify(
        {
          type: 'hourly',
          amount: 0,
        },
      ));
    }),
  ])
};
