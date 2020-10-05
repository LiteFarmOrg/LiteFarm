/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (20200430133453_make_field_crop_area_float.js) is part of LiteFarm.
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
      table.float('area_used').alter();
    }),
  ])
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.alterTable('fieldCrop', (table) => {
      table.integer('area_used').alter();
    }),
  ])
};
