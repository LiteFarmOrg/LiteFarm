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
export const up = async (knex) => {
  // Add new animal_movement entry to task_type table
  await knex('task_type').insert({
    task_name: 'Movement',
    task_translation_key: 'MOVEMENT_TASK',
  });

  // Add location_id column to animal and animal_batch tables (foreign key to location table)
  await knex.schema.alterTable('animal', (table) => {
    table.uuid('location_id').references('location_id').inTable('location');
  });
  await knex.schema.alterTable('animal_batch', (table) => {
    table.uuid('location_id').references('location_id').inTable('location');
  });

  // Create animal_movement_purpose enum table
  await knex.schema.createTable('animal_movement_purpose', (table) => {
    table.increments('id').primary();
    table.string('key').notNullable();
  });
  await knex('animal_movement_purpose').insert(
    [
      'GRAZING',
      'MILKING',
      'MANURE_MANAGEMENT',
      'PEST_OR_DISEASE_CONTROL',
      'BREEDING',
      'FEEDING',
      'VETERINARY_CARE',
      'BIRTHING',
      'WEANING',
      'TRANSPORTATION',
      'BEHAVIORAL_AND_SOCIAL_MANAGEMENT',
      'EXERCISE',
      'QUARANTINE',
      'OTHER',
    ].map((key) => ({ key })),
  );

  // Create animal_movement_task table
  await knex.schema.createTable('animal_movement_task', (table) => {
    table.integer('task_id').references('task_id').inTable('task').primary();
  });

  const [{ id: otherPurposeId }] = await knex('animal_movement_purpose').where({ key: 'OTHER' });

  // Create animal_movement_task_purpose_relationship table
  await knex.schema.createTable('animal_movement_task_purpose_relationship', (table) => {
    table.integer('task_id').references('task_id').inTable('task').notNullable();
    table.integer('purpose_id').references('id').inTable('animal_movement_purpose').notNullable();
    table.primary(['task_id', 'purpose_id']);
    table.string('other_purpose');
    table.check(
      `(other_purpose IS NOT NULL AND purpose_id = ${otherPurposeId}) OR (other_purpose IS NULL)`,
      [],
      'other_purpose_id_check',
    );
  });

  // Create task_animal_relationship table (links the task to the animals that are to be moved)
  await knex.schema.createTable('task_animal_relationship', (table) => {
    table.integer('task_id').references('task_id').inTable('task').notNullable();
    table.integer('animal_id').references('id').inTable('animal').notNullable();
  });

  // Create task_animal_batch_relationship table (similar to above but for batches)
  await knex.schema.createTable('task_animal_batch_relationship', (table) => {
    table.integer('task_id').references('task_id').inTable('task').notNullable();
    table.integer('animal_batch_id').references('id').inTable('animal_batch').notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex('task_type')
    .where({ task_translation_key: 'MOVEMENT_TASK' })
    .andWhere({ farm_id: null })
    .del();
  await knex.schema.alterTable('animal', (table) => table.dropColumn('location_id'));
  await knex.schema.alterTable('animal_batch', (table) => table.dropColumn('location_id'));

  const tablesToDelete = [
    'animal_movement_task',
    'animal_movement_task_purpose_relationship',
    'animal_movement_purpose',
    'task_animal_relationship',
    'task_animal_batch_relationship',
  ];

  for (const table of tablesToDelete) {
    await knex.schema.dropTable(table);
  }
};
