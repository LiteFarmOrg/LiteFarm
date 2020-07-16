/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (20200429142239_make_flags_in_crop_nullable.js) is part of LiteFarm.
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

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.alterTable('crop', (table) => {
      table.boolean('is_avg_depth').nullable().alter();
      table.boolean('is_avg_kc').nullable().alter();
      table.boolean('is_avg_nutrient').nullable().alter();
    }),
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.alterTable('crop', (table) => {
      table.boolean('is_avg_depth').defaultTo(false).notNullable().alter();
      table.boolean('is_avg_kc').defaultTo(false).notNullable().alter();
      table.boolean('is_avg_nutrient').defaultTo(false).notNullable().alter();
    }),
  ])
};
