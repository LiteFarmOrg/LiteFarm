/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (20190305205638_remove_unused_tables.js) is part of LiteFarm.
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
  //remove all the tables
  return Promise.all([
    knex.schema.dropTable('activityBeds'),
    knex.schema.dropTable('bed'),
    knex.schema.dropTable('userManages'),
  ])
};


exports.down = function(knex) {
  return Promise.all([
    knex.schema.createTable('userManages', function (table) {
      table.string('manager_id')
        .references('user_id')
        .inTable('users');
      table.string('manages_id')
        .references('user_id')
        .inTable('users');
      table.primary(['manages_id', 'manager_id']);
    }),
    knex.schema.createTable('bed', function (table) {
      table.uuid('bed_id').primary().defaultTo(knex.raw('uuid_generate_v1()'));
      table.uuid('field_id')
        .references('field_id')
        .inTable('field');
      table.float('bed_length').unsigned();
      table.integer('bed_index_in_field').unsigned().notNullable();

      table.index(['field_id']);
    }),
    knex.schema.createTable('activityBeds', function (table) {
      table.integer('activity_id')
        .references('activity_id')
        .inTable('activityLog')
        .onDelete('CASCADE');
      table.uuid('bed_id')
        .references('bed_id')
        .inTable('bed');
      table.primary(['bed_id', 'activity_id']);
    }),
  ])
};
