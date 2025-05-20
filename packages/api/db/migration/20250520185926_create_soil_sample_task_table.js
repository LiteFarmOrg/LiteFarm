/*
 *  Copyright 2025 LiteFarm.org
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
  await knex.schema.createTable('soil_sample_task', (table) => {
    table.integer('task_id').references('task_id').inTable('task').primary();
    table
      .uuid('document_id')
      .references('document_id')
      .inTable('document')
      .comment('Report document if uploaded');
    table.integer('samples_per_location').notNullable();
    table.jsonb('sample_depths').notNullable();

    table.check('jsonb_array_length(??) > 0', ['sample_depths'], 'sample_depths_not_empty_check');

    table.check(
      'jsonb_array_length(??) = ??',
      ['sample_depths', 'samples_per_location'],
      'sample_depths_length_check',
    );
  });

  await knex('task_type').insert({
    task_name: 'Soil Sample',
    task_translation_key: 'SOIL_SAMPLE_TASK',
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const down = async function (knex) {
  await knex('task_type')
    .where({ task_translation_key: 'SOIL_SAMPLE_TASK' })
    .andWhere({ farm_id: null })
    .del();

  await knex.schema.dropTable('soil_sample_task');
};
