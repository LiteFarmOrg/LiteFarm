/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (20180827142733_addPriceAndYield.js) is part of LiteFarm.
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
    knex.schema.dropTable('yield'),
    knex.schema.dropTable('price'),
    knex.schema.createTable('yield', (table) => {
      table.increments('yield_id');
      table.integer('crop_id')
        .references('crop_id')
        .inTable('crop');
      table.float('value_kg/acre');
      table.dateTime('date');
      table.uuid('farm_id')
        .references('farm_id')
        .inTable('farm').notNullable();
      // eslint-disable-next-line quotes,comma-spacing
    }),
    knex.schema.createTable('price', (table) => {
      table.increments('yield_id');
      table.integer('crop_id')
        .references('crop_id')
        .inTable('crop');
      table.float('value_$/kg');
      table.dateTime('date');
      table.uuid('farm_id')
        .references('farm_id')
        .inTable('farm').notNullable();
      // eslint-disable-next-line quotes,comma-spacing
    }),
  ])
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.dropTable('yield'),
    knex.schema.dropTable('price'),
    knex.schema.createTable('yield', (table) => {
      table.integer('crop_id')
        .references('crop_id')
        .inTable('crop').notNullable();
      table.uuid('farm_id')
        .references('farm_id')
        .inTable('farm').notNullable();
      table.dateTime('date');
      table.float('value');
      table.jsonb('grid_points');
    }),

    knex.schema.createTable('price', (table) => {
      table.integer('crop_id')
        .references('crop_id')
        .inTable('crop').notNullable();
      table.uuid('farm_id')
        .references('farm_id')
        .inTable('farm').notNullable();
      table.dateTime('date');
      table.float('value');
      table.jsonb('grid_points');
    }),
  ])
};
