/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (20190311140416_create_weather_table.js) is part of LiteFarm.
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
    knex.schema.createTable('weather', (table) => {
      table.increments('weather_id');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.float('min_degrees');
      table.float('max_degrees');
      table.float('min_humidity');
      table.float('max_humidity');
      table.float('precipitation');
      table.float('wind_speed');
      table.uuid('field_id').references('field_id').inTable('field').notNullable();
    }),
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('weather'),
  ])
};
