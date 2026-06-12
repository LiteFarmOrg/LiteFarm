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

/**
 * Aligns Venezuela's currency ISO code in the countries table between environments.
 *
 * Background: Venezuela redenominated in 2018, replacing the bolívar fuerte (VEF)
 * with the bolívar soberano (VES). The beta countries table was updated to VES but
 * production was not, leaving prod with the deprecated VEF code.
 *
 * This migration corrects prod to use VES. The filter on both country_code and iso
 * is intentional: it makes the migration safe to run on beta (where iso is already
 * VES and the WHERE clause simply matches no rows) without clobbering anything.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex('countries').where({ country_code: 'VE', iso: 'VEF' }).update({ iso: 'VES' });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex('countries').where({ country_code: 'VE', iso: 'VES' }).update({ iso: 'VEF' });
};
