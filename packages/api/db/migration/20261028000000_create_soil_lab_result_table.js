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

export const up = async function (knex) {
  await knex.schema.createTable('soil_lab_result', (table) => {
    table.uuid('soil_lab_result_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('farm_id').notNullable().references('farm_id').inTable('farm');
    table.uuid('submission_id').notNullable();
    table.integer('row').notNullable();
    table.uuid('location_id').notNullable().references('location_id').inTable('location');
    table.text('match_method').notNullable();
    table.text('sample_label');
    table.date('sampled_on');
    table.double('depth_top_cm').notNullable();
    table.double('depth_bottom_cm').notNullable();
    table.boolean('depth_assumed').notNullable();
    table.double('lat');
    table.double('lng');
    table.jsonb('values').notNullable();
    table.text('lab_name');
    table.text('source_filename').notNullable();
    table.text('source_sha256').notNullable();
    table.string('created_by_user_id').references('user_id').inTable('users');
    table.string('updated_by_user_id').references('user_id').inTable('users');
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
    table.boolean('deleted').notNullable().defaultTo(false);

    table.index(['farm_id']);
    table.index(['submission_id']);
    table.unique(['submission_id', 'row'], {
      indexName: 'soil_lab_result_submission_row_live_unique',
      predicate: knex.whereRaw('deleted = false'),
    });
  });

  await knex.raw(
    'ALTER TABLE soil_lab_result ADD CONSTRAINT soil_lab_result_depth_check CHECK (depth_top_cm < depth_bottom_cm)',
  );

  await knex('permissions').insert([
    { permission_id: 196, name: 'get:soil_lab_result', description: 'get soil_lab_result' },
    { permission_id: 197, name: 'add:soil_lab_result', description: 'add soil_lab_result' },
    { permission_id: 198, name: 'edit:soil_lab_result', description: 'edit soil_lab_result' },
  ]);

  await knex('rolePermissions').insert(
    [196, 197, 198].flatMap((permission_id) =>
      [1, 2, 3, 5].map((role_id) => ({ role_id, permission_id })),
    ),
  );
};

export const down = async function (knex) {
  await knex.schema.dropTable('soil_lab_result');

  const permissions = [196, 197, 198];
  await knex('rolePermissions').whereIn('permission_id', permissions).del();
  await knex('permissions').whereIn('permission_id', permissions).del();
};
