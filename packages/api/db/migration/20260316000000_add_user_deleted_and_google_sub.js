/*
 *  Copyright 2026 LiteFarm.org
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

// As of this migration, new SSO users receive a UUID user_id. The Google sub is stored in google_sub.

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.alterTable('users', function (table) {
    table.boolean('deleted').notNullable().defaultTo(false);
    table.string('google_sub').nullable();
  });

  await knex.raw(`UPDATE users SET google_sub = user_id WHERE user_id ~ '^\\d+$'`);

  await knex.schema.alterTable('users', function (table) {
    table.index('google_sub');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.alterTable('users', function (table) {
    table.dropIndex('google_sub');
    table.dropColumn('deleted');
    table.dropColumn('google_sub');
  });
};
