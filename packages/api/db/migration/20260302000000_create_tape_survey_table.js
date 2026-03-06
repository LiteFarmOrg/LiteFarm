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
  await knex.schema.createTable('tape_survey', function (table) {
    table.increments('id').primary();
    table.uuid('submission_id').notNullable().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('farm_id').notNullable().references('farm_id').inTable('farm');
    table.string('survey_version').notNullable();
    table.string('project_id').notNullable();
    table.string('survey_step').notNullable();
    table.jsonb('survey_response').notNullable();
    table
      .string('created_by_user_id')
      .notNullable()
      .references('user_id')
      .inTable('users')
      .defaultTo(1);
    table.dateTime('created_at').notNullable().defaultTo(new Date('2000/1/1').toISOString());
  });

  await knex('permissions').insert([
    { permission_id: 185, name: 'add:tape_survey', description: 'add tape_survey' },
    { permission_id: 186, name: 'get:tape_survey', description: 'get tape_survey' },
    { permission_id: 187, name: 'edit:tape_survey', description: 'edit tape_survey' },
  ]);
  await knex('rolePermissions').insert([
    { role_id: 1, permission_id: 185 },
    { role_id: 2, permission_id: 185 },
    { role_id: 5, permission_id: 185 },
    { role_id: 1, permission_id: 186 },
    { role_id: 2, permission_id: 186 },
    { role_id: 5, permission_id: 186 },
    { role_id: 1, permission_id: 187 },
    { role_id: 2, permission_id: 187 },
    { role_id: 5, permission_id: 187 },
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTable('tape_survey');
  await knex('rolePermissions').whereIn('permission_id', [185, 186, 187]).del();
  await knex('permissions').whereIn('permission_id', [185, 186, 187]).del();
};
