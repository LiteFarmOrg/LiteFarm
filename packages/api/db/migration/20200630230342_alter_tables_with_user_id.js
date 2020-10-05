/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (20200630230342_alter_tables_with_user_id.js) is part of LiteFarm.
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

// drops constraints
exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('shift', (table) => {
      table.dropForeign('user_id')
    }),
    knex.schema.table('userFarm', (table) => {
      table.dropForeign('user_id')
    }),
    knex.schema.table('farmDataSchedule', (table) => {
      table.dropForeign('user_id')
    }),
    knex.schema.table('activityLog', (table) => {
      table.dropForeign('user_id')
    }),
  ])
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.alterTable('shift', (table) => {
      table.string('user_id')
        .references('user_id')
        .inTable('users').alter();
    }),
    knex.schema.alterTable('userFarm', (table) => {
      table.string('user_id')
        .references('user_id')
        .inTable('users').alter();
    }),
    knex.schema.alterTable('farmDataSchedule', (table) => {
      table.string('user_id')
        .references('user_id')
        .inTable('users').alter();
    }),
    knex.schema.alterTable('activityLog', (table) => {
      table.string('user_id')
        .references('user_id')
        .inTable('users').alter();
    }),
  ])
};
