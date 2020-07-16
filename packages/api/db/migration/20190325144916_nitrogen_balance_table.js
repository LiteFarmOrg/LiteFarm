/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (20190325144916_nitrogen_balance_table.js) is part of LiteFarm.
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
    knex.schema.createTable('nitrogenBalance', (table) => {
      table.increments('nitrogen_id');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.uuid('field_id').references('field_id').inTable('field').onDelete('CASCADE').notNullable();
      table.float('nitrogen_value');
    }),
    knex.schema.createTable('nitrogenSchedule', (table) => {
      table.increments('nitrogen_schedule_id');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('scheduled_at');
      table.uuid('farm_id').references('farm_id').inTable('farm').notNullable();
    }),
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('nitrogenBalance'),
    knex.schema.dropTable('nitrogenSchedule'),
  ])
};
