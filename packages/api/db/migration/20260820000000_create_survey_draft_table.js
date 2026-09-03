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
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable('survey_draft', (table) => {
    table.increments('id').primary();
    table.uuid('submission_id').notNullable().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('farm_id').notNullable().references('farm_id').inTable('farm');
    table.string('survey_key').notNullable();
    table.string('survey_version').notNullable();
    table.jsonb('survey_data').notNullable();
    table.integer('current_page_no').notNullable().defaultTo(0);
    table.string('created_by_user_id').references('user_id').inTable('users');
    table.string('updated_by_user_id').references('user_id').inTable('users');
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
    table.boolean('deleted').notNullable().defaultTo(false);

    // One live (non-deleted) draft per farm+survey_key.
    table.unique(['farm_id', 'survey_key'], {
      indexName: 'survey_draft_farm_survey_live_unique',
      predicate: knex.whereRaw('deleted = false'),
    });
  });

  // No add:survey_draft — a single route handles create-or-update, gated on edit:survey_draft alone.
  await knex('permissions').insert([
    { permission_id: 193, name: 'get:survey_draft', description: 'get survey_draft' },
    { permission_id: 194, name: 'edit:survey_draft', description: 'edit survey_draft' },
  ]);

  await knex('rolePermissions').insert([
    { role_id: 1, permission_id: 193 },
    { role_id: 2, permission_id: 193 },
    { role_id: 5, permission_id: 193 },
    { role_id: 1, permission_id: 194 },
    { role_id: 2, permission_id: 194 },
    { role_id: 5, permission_id: 194 },
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTable('survey_draft');

  const permissions = [193, 194];
  await knex('rolePermissions').whereIn('permission_id', permissions).del();
  await knex('permissions').whereIn('permission_id', permissions).del();
};
