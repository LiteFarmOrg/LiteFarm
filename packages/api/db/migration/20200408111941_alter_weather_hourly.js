/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (20200408111941_alter_weather_hourly.js) is part of LiteFarm.
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
    knex.schema.table('weatherHourly', (table) => {
      table.dropColumn('humidity');
      table.float('min_humidity');
      table.float('max_humidity');
      table.integer('data_points');
    }),
    knex.schema.table('weather', (table) => {
      table.integer('data_points');
    }),
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('weatherHourly', (table) => {
      table.float('humidity');
      table.dropColumn('min_humidity');
      table.dropColumn('max_humidity');
      table.dropColumn('data_points');
    }),
    knex.schema.table('weather', (table) => {
      table.dropColumn('data_points')
    }),
  ])
};
