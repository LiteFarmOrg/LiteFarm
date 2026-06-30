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
 * - Renames `tape_survey` to `survey_response` and adds a `survey_key` column identifying which survey each row answers
 * - Makes `survey_step` nullable, as it is TAPE-specific and not used by every survey
 * - Repurposes the TAPE permissions to generic survey_response permissions (add/get/edit).
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.renameTable('tape_survey', 'survey_response');

  await knex.schema.alterTable('survey_response', function (table) {
    table.string('survey_key').nullable();
  });

  // Every existing row is a TAPE response.
  await knex('survey_response').update({ survey_key: 'tape' });
  await knex.schema.alterTable('survey_response', function (table) {
    table.string('survey_key').notNullable().alter();
  });

  await knex.schema.alterTable('survey_response', function (table) {
    table.string('survey_step').nullable().alter();
  });

  // Repurpose the TAPE permissions (names only)
  await knex('permissions')
    .where({ permission_id: 185 })
    .update({ name: 'add:survey_response', description: 'add survey_response' });
  await knex('permissions')
    .where({ permission_id: 186 })
    .update({ name: 'get:survey_response', description: 'get survey_response' });
  await knex('permissions')
    .where({ permission_id: 187 })
    .update({ name: 'edit:survey_response', description: 'edit survey_response' });
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
    table.string('survey_step').notNullable().alter();
  });
  await knex.schema.alterTable('survey_response', function (table) {
    table.dropColumn('survey_key');
  });
  await knex.schema.renameTable('survey_response', 'tape_survey');
};
