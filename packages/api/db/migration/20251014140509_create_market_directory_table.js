/*
 *  Copyright 2025 LiteFarm.org
 *  This file is part of LiteFarm.
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

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const up = async (knex) => {
  await knex.schema.createTable('market_directory_data', (table) => {
    table.uuid('farm_id').references('farm_id').inTable('farm').primary();
    table.string('farm_name').notNullable();
    table.string('logo');
    table.text('about');
    table.string('representative_first_name').notNullable();
    table.string('representative_last_name').notNullable().defaultTo('');
    table.string('email').notNullable();
    table.string('phone_number');
    table.string('location').notNullable();
    table.text('website');
    table.string('instagram');
    table.string('facebook');
    table.string('x');
    table.string('youtube');
    table
      .string('created_by_user_id')
      .references('user_id')
      .inTable('users')
      .notNullable()
      .defaultTo(1);
    table
      .string('updated_by_user_id')
      .references('user_id')
      .inTable('users')
      .notNullable()
      .defaultTo(1);
    table.dateTime('created_at').notNullable().defaultTo(new Date('2000/1/1').toISOString());
    table.dateTime('updated_at').notNullable().defaultTo(new Date('2000/1/1').toISOString());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.dropTable('market_directory_data');
};
