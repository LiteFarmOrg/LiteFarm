/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (20180827135325_addFieldName.js) is part of LiteFarm.
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

exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('sensors', function (table) {
      table.uuid('id').primary().notNullable();
      table.string('name').notNullable();
      table.float('latitude').notNullable();
      table.float('longtidue').notNullable();
      table.integer('type').notNullable();
      table.float('depth');
      table.float('elevation');
    }),

    // We likely dont need this table

    // knex.schema.createTable('sensor_paramaters', function (table) {
    //     table.uuid('id').primary().notNullable();
    //     table.integer('sensor_id').notNullable();
    //     table.integer('parameter_number').notNullable();
    //     table.string('type').notNullable();
    //     table.string('parameter_measured').notNullable();
    //     table.string('unit').notNullable();
    //     table.float('min_value');
    //     table.float('max_value');

    // }),

    knex.schema.createTable('sensor_readings', function (table) {
      table.uuid('id').primary().notNullable();
      table.timestamp('read_time').defaultTo(knex.fn.now());
      table.timestamp('transmit_time').notNullable();
      table.integer('sensor_id').notNullable();
      table.string('reading_type').notNullable();
      table.float('value').notNullable();
    }),
  ]);
};

exports.down = function (knex) {
  //remove all the tables
  return Promise.all([
    knex.schema.dropTable('sensors'),
    //   knex.schema.dropTable('sensor_parameter'),
    knex.schema.dropTable('sensor_readings'),
  ]);
};
