/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (20180826153304_deleteFarmCrop.js) is part of LiteFarm.
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
    knex.schema.dropTable('cropBed'),
    knex.schema.dropTable('cropSale'),
    knex.schema.dropTable('shiftTask'),
    knex.schema.dropTable('activityCrops'),
    knex.schema.dropTable('farmCrop'),

    knex.schema.createTable('fieldCrop', (table) => {
      table.increments('field_crop_id');
      table.integer('crop_id')
        .references('crop_id')
        .inTable('crop').notNullable();
      table.uuid('field_id')
        .references('field_id')
        .inTable('field').onDelete('CASCADE').notNullable();
      table.dateTime('start_date');
      table.dateTime('end_date');
      table.float('area_used');
      table.float('estimated_production');
      table.string('variety');
    }),

    knex.schema.createTable('cropSale', (table) => {
      table.integer('field_crop_id')
        .references('field_crop_id')
        .inTable('fieldCrop').onDelete('CASCADE');
      table.integer('sale_id')
        .references('sale_id')
        .inTable('sale').onDelete('CASCADE');
      table.integer('quantity').unsigned();
      table.integer('sale_value');
    }),

    knex.schema.createTable('shiftTask', (table) => {
      table.integer('task_id')
        .references('task_id')
        .inTable('taskType');
      table.uuid('shift_id')
        .references('shift_id')
        .inTable('shift');
      table.integer('field_crop_id')
        .references('field_crop_id')
        .inTable('fieldCrop').onDelete('CASCADE').nullable();
      table.boolean('is_field').defaultTo(false);
      table.uuid('field_id')
        .references('field_id')
        .inTable('field').onDelete('CASCADE').nullable();
      table.integer('duration').notNullable();
    }),

    knex.schema.createTable('activityCrops', function (table) {
      table.integer('activity_id')
        .references('activity_id')
        .inTable('activityLog')
        .onDelete('CASCADE');
      table.integer('field_crop_id')
        .references('field_crop_id')
        .inTable('fieldCrop').onDelete('CASCADE');
      table.float('quantity').unsigned();
      table.enu('quantity_unit', ['lb', 'kg']).defaultTo('kg');
      table.primary(['activity_id', 'field_crop_id']);
    }),

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
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.dropTable('activityCrops'),
    knex.schema.dropTable('shiftTask'),
    knex.schema.dropTable('cropSale'),
    knex.schema.dropTable('yield'),
    knex.schema.dropTable('price'),
    knex.raw('DROP TABLE "fieldCrop" cascade'),
    knex.schema.createTable('farmCrop', (table) => {
      table.increments('farm_crop_id');
      table.integer('crop_id')
        .references('crop_id')
        .inTable('crop').notNullable();
      table.uuid('farm_id')
        .references('farm_id')
        .inTable('farm').notNullable();
      table.float('expected_yield');
      table.string('variety');
      table.unique(['crop_id', 'farm_id', 'variety']);
    }),
    knex.schema.createTable('cropSale', (table) => {
      table.integer('farm_crop_id')
        .references('farm_crop_id')
        .inTable('farmCrop');
      table.integer('sale_id')
        .references('sale_id')
        .inTable('sale').onDelete('CASCADE');
      table.integer('quantity').unsigned();
      table.integer('sale_value');
    }),
    knex.schema.createTable('shiftTask', (table) => {
      table.uuid('shift_id')
        .references('shift_id')
        .inTable('shift');
      table.integer('farm_crop_id')
        .references('farm_crop_id')
        .inTable('farmCrop').notNullable();
      table.boolean('is_field').defaultTo(false);
      table.uuid('field_id')
        .references('field_id')
        .inTable('field').nullable();
      table.integer('duration').notNullable();
    }),
    knex.schema.createTable('activityCrops', function (table) {
      table.integer('activity_id')
        .references('activity_id')
        .inTable('activityLog')
        .onDelete('CASCADE');
      table.integer('farm_crop_id')
        .references('farm_crop_id')
        .inTable('farmCrop');
      table.float('quantity').unsigned();
      table.enu('quantity_unit', ['lb', 'kg']).defaultTo('kg');
      table.primary(['activity_id', 'farm_crop_id']);
    }),
    knex.schema.createTable('cropBed', function (table) {
      table.integer('farm_crop_id')
        .references('farm_crop_id')
        .inTable('farmCrop');
      table.uuid('bed_id')
        .references('bed_id')
        .inTable('bed');
      table.float('length').notNullable();
      table.integer('crop_bed_index_in_bed').notNullable();
      table.primary(['bed_id', 'farm_crop_id']);
    }),
  ]);
};
