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

const TABLES = ['survey_response', 'survey_draft'];

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  for (const table of TABLES) {
    await knex(table)
      .where({ survey_key: 'tape' })
      .whereLike('survey_version', 'TAPE\\_Mornington\\_%')
      .update({ survey_key: 'tape_au' });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  for (const table of TABLES) {
    await knex(table).where({ survey_key: 'tape_au' }).update({ survey_key: 'tape' });
  }
};
