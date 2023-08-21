/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (20190308183222_add_water_balance_table.js) is part of LiteFarm.
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

export const up = function (knex) {
  return Promise.all([
    knex.schema.createTable('waterBalance', (table) => {
      table.increments('water_balance_id');
      table.integer('crop_id').references('crop_id').inTable('crop').notNullable();
      table.uuid('field_id').references('field_id').inTable('field').onDelete('CASCADE').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.float('soil_water').notNullable();
      table.float('plant_available_water').notNullable();
    }),
  ]);
};

export const down = function (knex) {
  return Promise.all([knex.schema.dropTable('waterBalance')]);
};
