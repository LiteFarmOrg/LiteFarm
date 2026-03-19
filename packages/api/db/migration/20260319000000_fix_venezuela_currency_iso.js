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
