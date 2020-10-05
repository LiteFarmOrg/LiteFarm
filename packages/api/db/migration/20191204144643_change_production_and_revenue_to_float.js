/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (20191204144643_change_production_and_revenue_to_float.js) is part of LiteFarm.
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
    knex.schema.alterTable('fieldCrop', (table) => {
      table.float('estimated_production').alter();
      table.float('estimated_revenue').alter();
    }),
  ])
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.alterTable('fieldCrop', (table) => {
      table.integer('estimated_production').alter();
      table.integer('estimated_revenue').alter();
    }),
  ])
};
