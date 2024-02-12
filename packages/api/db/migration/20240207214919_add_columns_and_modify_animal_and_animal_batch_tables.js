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
  const getNextInternalIdentifier = async (farmId) => {
    const result = await knex.raw(`
      SELECT COALESCE(MAX(internal_identifier), 0) AS max_internal_identifier
      FROM (
        SELECT internal_identifier FROM animal WHERE farm_id = '${farmId}'
        UNION ALL
        SELECT internal_identifier FROM animal_batch WHERE farm_id = '${farmId}'
      ) AS combined_internal_identifiers
    `);

    return result.rows[0].max_internal_identifier + 1;
  };

  try {
    await knex.schema.alterTable('animal', (table) => {
      table.integer('internal_identifier');
      table.string('photo_url');
      table.dropChecks(['name_identifier_check']);

      // Add unique constraint on internal_identifier column within the same farm_id in the table
      table.unique(['farm_id', 'internal_identifier']);
    });

    await knex.schema.alterTable('animal_batch', (table) => {
      table.integer('internal_identifier');
      table.string('photo_url');
      table.string('name').nullable().alter();

      // Add unique constraint on internal_identifier column within the same farm_id in the table
      table.unique(['farm_id', 'internal_identifier']);
    });

    for (const tableName of ['animal', 'animal_batch']) {
      // add internal_identifier to the existing records
      await knex.transaction(async (trx) => {
        const records = await trx.select('id', 'farm_id').from(tableName);

        for (const record of records) {
          const { id, farm_id } = record;
          const internalIdentifier = await getNextInternalIdentifier(farm_id);
          await trx(tableName).update({ internal_identifier: internalIdentifier }).where('id', id);
        }
      });

      // make internal_identifier column not nullable
      await knex.schema.alterTable(tableName, async (table) => {
        table.integer('internal_identifier').notNullable().alter();
      });
    }

    // Create function to assign internal_identifier to a record (NEW) to be inserted
    await knex.raw(`
      CREATE FUNCTION assign_internal_identifier_trigger()
      RETURNS TRIGGER AS $$
      DECLARE
        max_internal_identifier INTEGER;
      BEGIN
        -- Get the maximum internal_identifier for the given farm_id
        SELECT COALESCE(MAX(internal_identifier), 0) INTO max_internal_identifier
        FROM (
          SELECT internal_identifier FROM animal WHERE farm_id = NEW.farm_id
          UNION ALL
          SELECT internal_identifier FROM animal_batch WHERE farm_id = NEW.farm_id
        ) AS combined_internal_identifiers;

        -- Increment the maximum internal_identifier
        NEW.internal_identifier := max_internal_identifier + 1;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create trigger for animal table
    await knex.raw(`
      CREATE TRIGGER increment_internal_identifier_trigger_animal
      BEFORE INSERT ON animal
      FOR EACH ROW
      EXECUTE FUNCTION assign_internal_identifier_trigger();
    `);

    // Create trigger for animal_batch table
    await knex.raw(`
      CREATE TRIGGER increment_internal_identifier_trigger_animal_batch
      BEFORE INSERT ON animal_batch
      FOR EACH ROW
      EXECUTE FUNCTION assign_internal_identifier_trigger();
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
  await knex.schema.alterTable('animal', (table) => {
    table.dropUnique(['farm_id', 'internal_identifier']);
    table.dropColumn('internal_identifier');
    table.dropColumn('photo_url');
  });

  // table.check does not work in alterTable
  await knex.schema.raw(`
    ALTER TABLE animal
    ADD CONSTRAINT name_identifier_check
    CHECK (name IS NOT NULL OR identifier IS NOT NULL);
  `);

  await knex.schema.alterTable('animal_batch', (table) => {
    table.dropUnique(['farm_id', 'internal_identifier']);
    table.dropColumn('internal_identifier');
    table.dropColumn('photo_url');
    table.string('name').notNullable().alter();
  });

  await knex.raw(`
    DROP TRIGGER IF EXISTS increment_internal_identifier_trigger_animal ON animal;
  `);

  await knex.raw(`
    DROP TRIGGER IF EXISTS increment_internal_identifier_trigger_animal_batch ON animal_batch;
  `);

  await knex.raw(`
    DROP FUNCTION IF EXISTS assign_internal_identifier_trigger;
  `);
};
