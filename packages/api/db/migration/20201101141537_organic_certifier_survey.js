/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (20180517190849_create_lite_farm_db.js) is part of LiteFarm.
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

exports.up = async function (knex) {
  return Promise.all([
    knex.schema.createTable('organicCertifierSurvey', function (table) {
      table.uuid('survey_id').primary().defaultTo(knex.raw('uuid_generate_v1()'));
      table.uuid('farm_id').references('farm_id').inTable('farm').unique();
      table.string('created_by_user_id').references('user_id').inTable('users');
      table.string('updated_by_user_id').references('user_id').inTable('users');
      table.dateTime('created_at').notNullable();
      table.dateTime('updated_at').notNullable();
      table.jsonb('certifiers').defaultTo(JSON.stringify([]));
      table.boolean('interested').defaultTo(false).notNullable();
    }),
    knex.schema.alterTable('organicCertifierSurvey', (table) => {
      table.foreign(['farm_id', 'created_by_user_id']).references(['farm_id', 'user_id']).inTable('userFarm');
      table.foreign(['farm_id', 'updated_by_user_id']).references(['farm_id', 'user_id']).inTable('userFarm');
    }),
    knex('permissions').insert([
      { name: 'get:organic_certifier_survey', permission_id: 85, description: 'Get organic certifier survey' },
      { name: 'add:organic_certifier_survey', permission_id: 86, description: 'Submit a organic certifier survey' },
      { name: 'edit:organic_certifier_survey', permission_id: 87, description: 'Edit a organic certifier survey' },
    ]),
    knex('rolePermissions').insert([
      { role_id: 5, permission_id: 85 },
      { role_id: 5, permission_id: 86 },
      { role_id: 5, permission_id: 87 },
      { role_id: 1, permission_id: 85 },
      { role_id: 1, permission_id: 86 },
      { role_id: 1, permission_id: 87 },
      { role_id: 2, permission_id: 85 },
      { role_id: 2, permission_id: 86 },
      { role_id: 2, permission_id: 87 },
    ]),
  ])
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTable('organicCertifierSurvey'),
    knex('rolePermissions').whereIn('permission_id', [85, 86, 87]).del(),
    knex('permissions').whereIn('permission_id', [85, 86, 87]).del(),
  ])
};
