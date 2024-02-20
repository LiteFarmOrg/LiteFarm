/*
 *  Copyright 2024 LiteFarm.org
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
export const up = async function (knex) {
  try {
    await knex.schema.alterTable('animal', (table) => {
      table.string('photo_url');
      table.dropChecks(['name_identifier_check']);
    });

    await knex.schema.alterTable('animal_batch', (table) => {
      table.string('photo_url');
      table.string('name').nullable().alter();
    });

    // Create function to assign internal_identifier to a record (NEW) to be inserted
    await knex.raw(`
      CREATE VIEW animal_union_batch_internal_identifier AS
      SELECT
        *,
        ROW_NUMBER() OVER (PARTITION BY farm_id ORDER BY created_at)::INTEGER AS internal_identifier
      FROM (
        SELECT
          id,
          farm_id,
          FALSE AS batch,
          created_at
        FROM
          animal a

        UNION ALL

        SELECT
          id,
          farm_id,
          TRUE AS batch,
          created_at
        FROM
          animal_batch ab
      ) animal_union_batch_internal_identifier
      ORDER BY
        created_at;
    `);
  } catch (error) {
    console.error('Error in migration up:', error);
    throw error; // Rethrow the error to ensure the migration fails
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.dropView('animal_union_batch_internal_identifier');

  await knex.schema.alterTable('animal', (table) => {
    table.dropColumn('photo_url');
    // ?? does not work in alterTable
    table.check('name IS NOT NULL OR identifier IS NOT NULL', [], 'name_identifier_check');
  });

  await knex.schema.alterTable('animal_batch', (table) => {
    table.dropColumn('photo_url');
    table.string('name').notNullable().alter();
  });
};
