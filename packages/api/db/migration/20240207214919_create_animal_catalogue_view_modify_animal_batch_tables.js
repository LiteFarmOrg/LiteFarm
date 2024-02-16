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
      CREATE VIEW animal_catalogue AS
      SELECT
        *,
        ROW_NUMBER() OVER (PARTITION BY farm_id ORDER BY created_at)::INTEGER AS internal_identifier
      FROM (
        SELECT
          id,
          farm_id,
          default_type_id,
          custom_type_id,
          default_breed_id,
          custom_breed_id,
          name,
          identifier,
          (SELECT array_agg(animal_group_id) FROM animal_group_relationship WHERE animal_id = a.id) AS related_group_ids,
          1 AS count,
          FALSE AS batch,
          deleted,
          created_at
        FROM
          animal a

        UNION ALL

        SELECT
          id,
          farm_id,
          default_type_id,
          custom_type_id,
          default_breed_id,
          custom_breed_id,
          name,
          NULL AS identifier,
          (SELECT array_agg(animal_group_id) FROM animal_batch_group_relationship WHERE animal_batch_id = ab.id) AS related_group_ids,
          count,
          TRUE AS batch,
          deleted,
          created_at
        FROM
          animal_batch ab
      ) animal_union_batch
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
  await knex.schema.dropViewIfExists('animal_catalogue');

  await knex.schema.alterTable('animal', (table) => {
    table.dropColumn('photo_url');
  });

  // table.check does not work in alterTable
  await knex.schema.raw(`
    ALTER TABLE animal
    ADD CONSTRAINT name_identifier_check
    CHECK (name IS NOT NULL OR identifier IS NOT NULL);
  `);

  await knex.schema.alterTable('animal_batch', (table) => {
    table.dropColumn('photo_url');
    table.string('name').notNullable().alter();
  });
};
