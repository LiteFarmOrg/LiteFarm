/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const up = async function (knex) {
  await knex.schema.createTable('animal_identifier', (table) => {
    table.increments('id').primary();
    table.string('key').notNullable();
  });

  await knex.raw(`
    CREATE TEMPORARY TABLE temp AS
    SELECT * FROM animal_identifier_placement;
  `);

  await knex.schema.alterTable('animal', (t) => {
    t.dropForeign('identifier_placement_id');
  });

  await knex.schema.dropTable('animal_identifier_placement');

  await knex.schema.createTable('animal_identifier_placement', (table) => {
    table.increments('id').primary();
    table.integer('identifier_id').references('id').inTable('animal_identifier').notNullable();
    table.string('key').notNullable();
  });

  await knex('animal_identifier').insert([
    { id: 1, key: 'EAR_TAG' },
    { id: 2, key: 'LEG_BAND' },
    { id: 3, key: 'OTHER' },
  ]);

  await knex('animal_identifier_placement').insert([
    { identifier_id: 1, key: 'LEFT_EAR' },
    { identifier_id: 1, key: 'RIGHT_EAR' },
    { identifier_id: 2, key: 'LEFT_LEG' },
    { identifier_id: 2, key: 'RIGHT_LEG' },
    { identifier_id: 3, key: 'OTHER' },
  ]);

  await knex.raw(`
    UPDATE animal
    SET identifier_placement_id = (
      SELECT aip.id 
      FROM animal_identifier_placement aip 
      JOIN temp ON aip.key = temp.key
      WHERE animal.identifier_placement_id = temp.id
    )
  `);

  await knex.schema.alterTable('animal', (t) => {
    t.foreign('identifier_placement_id').references('id').inTable('animal_identifier_placement');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const down = async function (knex) {
  await knex.raw(`
    CREATE TEMPORARY TABLE temp AS
    SELECT * FROM animal_identifier_placement;
  `);

  await knex.schema.alterTable('animal', (t) => {
    t.dropForeign('identifier_placement_id');
  });

  await knex.schema.dropTable('animal_identifier_placement');

  await knex.schema.createTable('animal_identifier_placement', (table) => {
    table.increments('id').primary();
    table.integer('default_type_id').references('id').inTable('default_animal_type').notNullable();
    table.string('key').notNullable();
  });

  await knex.raw(`
    INSERT INTO animal_identifier_placement (default_type_id, key)
    SELECT id as default_type_id, placement as key
    FROM default_animal_type dat
    CROSS JOIN UNNEST(ARRAY['LEFT_EAR', 'RIGHT_EAR', 'LEFT_LEG', 'RIGHT_LEG']) AS placement
    WHERE (dat.key IN ('CATTLE', 'PIGS') AND placement IN ('LEFT_EAR', 'RIGHT_EAR'))
      OR (dat.key = 'CHICKEN' AND placement IN ('LEFT_LEG', 'RIGHT_LEG'))
    ORDER BY default_type_id;

    UPDATE animal
    SET identifier_placement_id = (
      SELECT aip.id FROM animal_identifier_placement aip
      WHERE animal.default_type_id = aip.default_type_id
      AND aip.key = (
        SELECT key FROM temp
        WHERE animal.identifier_placement_id = temp.id
      )
    )
  `);

  await knex.schema.alterTable('animal', (t) => {
    t.foreign('identifier_placement_id').references('id').inTable('animal_identifier_placement');
  });

  await knex.schema.dropTable('animal_identifier');
};
