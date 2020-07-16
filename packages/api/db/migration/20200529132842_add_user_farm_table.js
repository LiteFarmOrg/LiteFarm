/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (20200529132842_add_user_farm_table.js) is part of LiteFarm.
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
    knex.schema.createTable('userFarm', (table) => {
      table.string('user_id')
        .references('user_id')
        .inTable('users').onDelete('CASCADE').notNullable();
      table.uuid('farm_id')
        .references('farm_id')
        .inTable('farm').onDelete('CASCADE').nullable();
      table.primary(['user_id', 'farm_id']);
      table.integer('role_id').references('role_id').inTable('role').nullable();
      table.boolean('has_consent').notNullable().defaultTo(false);
      table.boolean('is_deleted').notNullable().defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
    }),
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('userFarm'),
  ])
};
