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
  await knex.schema.createTable('market_directory_partner', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
  });

  await knex.schema.createTable('market_directory_partner_country', (table) => {
    table.increments('id').primary();
    table
      .integer('market_directory_partner_id')
      .references('id')
      .inTable('market_directory_partner')
      .notNullable();
    table.integer('country_id').references('id').inTable('countries').nullable();

    table.unique(['market_directory_partner_id', 'country_id']);
  });

  // Prohibit multiple records with null country_id for the same partner
  await knex.raw(`
  CREATE UNIQUE INDEX market_directory_partner_country_null_country_unique
  ON market_directory_partner_country (market_directory_partner_id)
  WHERE country_id IS NULL
`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.raw('DROP INDEX IF EXISTS market_directory_partner_country_null_country_unique');
  await knex.schema.dropTable('market_directory_partner_country');
  await knex.schema.dropTable('market_directory_partner');
};
