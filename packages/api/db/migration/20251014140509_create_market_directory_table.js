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
  await knex.schema.createTable('market_directory_info', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('farm_id').unique().notNullable().references('farm_id').inTable('farm');
    table.string('farm_name').notNullable();
    table.string('logo');
    table.text('about');
    table.string('contact_first_name').notNullable();
    table.string('contact_last_name').notNullable().defaultTo('');
    table.string('contact_email').notNullable();
    table.string('email');
    table.integer('country_code');
    table.string('phone_number');
    table.string('address').notNullable();
    table.text('website');
    table.string('instagram');
    table.string('facebook');
    table.string('x');
    table.boolean('deleted').notNullable().defaultTo(false);
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
  await knex.schema.dropTable('market_directory_info');
};
