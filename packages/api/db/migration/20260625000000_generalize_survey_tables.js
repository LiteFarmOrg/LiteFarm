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
 * Generalizes the bespoke TAPE survey storage into a reusable, multi-survey model:
 * - `survey` reference table (one row per survey kind) + `survey_country` join table that
 *   both gates availability and selects the CDN JSON version (NULL country_id = global default).
 * - Renames `tape_survey` to `survey_response` and adds a `survey_id` foreign key.
 * - Repurposes the three TAPE permissions to generic survey permissions.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable('survey', function (table) {
    table.increments('id').primary();
    table.string('key').notNullable().unique();
    table.string('cdn_directory').notNullable();
  });

  await knex.schema.createTable('survey_country', function (table) {
    table.increments('id').primary();
    table.integer('survey_id').notNullable().references('id').inTable('survey');
    table.integer('country_id').nullable().references('id').inTable('countries');
    table.string('version').notNullable();
    table.unique(['survey_id', 'country_id']);
  });

  // Prohibit multiple global (null country_id) rows for the same survey.
  await knex.raw(`
    CREATE UNIQUE INDEX survey_country_null_country_unique
    ON survey_country (survey_id)
    WHERE country_id IS NULL
  `);

  // Seed the existing TAPE survey: visible everywhere with the FAO default, AU overrides to au.json.
  const [tape] = await knex('survey')
    .insert({ key: 'tape', cdn_directory: 'tape_surveys' })
    .returning('*');
  const australia = await knex('countries').where({ country_name: 'Australia' }).first();
  await knex('survey_country').insert([
    { survey_id: tape.id, country_id: null, version: 'fao' },
    { survey_id: tape.id, country_id: australia.id, version: 'au' },
  ]);

  // Rename the TAPE response table to the generic survey_response table and attach it to `survey`.
  await knex.schema.renameTable('tape_survey', 'survey_response');
  await knex.schema.alterTable('survey_response', function (table) {
    table.integer('survey_id').nullable().references('id').inTable('survey');
  });
  await knex('survey_response').update({ survey_id: tape.id });
  await knex.schema.alterTable('survey_response', function (table) {
    table.integer('survey_id').notNullable().alter();
  });

  // Repurpose the TAPE permissions (names only) so existing rolePermissions rows keep working.
  await knex('permissions')
    .where({ permission_id: 185 })
    .update({ name: 'add:survey_response', description: 'add survey_response' });
  await knex('permissions')
    .where({ permission_id: 186 })
    .update({ name: 'get:survey_response', description: 'get survey_response' });
  await knex('permissions')
    .where({ permission_id: 187 })
    .update({ name: 'get:survey', description: 'get survey' });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex('permissions')
    .where({ permission_id: 185 })
    .update({ name: 'add:tape_survey', description: 'add tape_survey' });
  await knex('permissions')
    .where({ permission_id: 186 })
    .update({ name: 'get:tape_survey', description: 'get tape_survey' });
  await knex('permissions')
    .where({ permission_id: 187 })
    .update({ name: 'edit:tape_survey', description: 'edit tape_survey' });

  await knex.schema.alterTable('survey_response', function (table) {
    table.dropColumn('survey_id');
  });
  await knex.schema.renameTable('survey_response', 'tape_survey');

  await knex.schema.dropTable('survey_country');
  await knex.schema.dropTable('survey');
};
