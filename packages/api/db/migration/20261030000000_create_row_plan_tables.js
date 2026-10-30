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

const baseColumns = (knex, t) => {
  t.string('created_by_user_id').references('user_id').inTable('users');
  t.string('updated_by_user_id').references('user_id').inTable('users');
  t.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
  t.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
  t.boolean('deleted').notNullable().defaultTo(false);
};

/**
 * Row plans: planned crop rows for a field, from the in-app planner or a robot, and the link from tasks to rows.
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable('row_plan', (t) => {
    t.uuid('row_plan_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('farm_id').notNullable().references('farm_id').inTable('farm');
    t.uuid('location_id').notNullable().references('location_id').inTable('location');
    t.enu('source', ['in_app', 'robot']).notNullable();
    // Only robot plans have a map_id and map_hash. Both are set by the station.
    t.string('map_id', 100);
    t.string('map_hash', 64);
    t.string('inputs_hash', 64);
    t.integer('schema_version').notNullable().defaultTo(1);
    t.string('generator');
    t.jsonb('origin');
    t.jsonb('params');
    t.uuid('supersedes_row_plan_id').references('row_plan_id').inTable('row_plan');
    t.string('supersedes_map_id', 100);
    t.dateTime('superseded_at');
    baseColumns(knex, t);
    t.unique(['farm_id', 'map_id'], {
      indexName: 'row_plan_farm_map_id_live_unique',
      predicate: knex.whereRaw('deleted = false AND map_id IS NOT NULL'),
    });
    t.index(['farm_id', 'location_id']);
  });
  await knex.raw(`
    ALTER TABLE row_plan
      ADD CONSTRAINT row_plan_map_fields_match_source CHECK (
        (source = 'robot' AND map_id IS NOT NULL AND map_hash IS NOT NULL)
        OR (source = 'in_app' AND map_id IS NULL AND map_hash IS NULL)
      )
  `);

  await knex.schema.createTable('field_row', (t) => {
    t.uuid('row_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('row_plan_id')
      .notNullable()
      .references('row_plan_id')
      .inTable('row_plan')
      .onDelete('CASCADE');
    // row_number is the id missions use. A row split by an obstacle has several fragments.
    t.integer('row_number').notNullable();
    t.integer('frag').notNullable().defaultTo(0);
    // Mission order.
    t.integer('position').notNullable();
    t.jsonb('line_points').notNullable();
    t.decimal('length', 24, 2).notNullable();
    baseColumns(knex, t);
    t.unique(['row_plan_id', 'row_number', 'frag']);
    t.unique(['row_plan_id', 'position']);
  });

  await knex.schema.createTable('task_row', (t) => {
    t.integer('task_id').notNullable().references('task_id').inTable('task').onDelete('CASCADE');
    t.uuid('row_id').notNullable().references('row_id').inTable('field_row').onDelete('CASCADE');
    t.enu('status', ['pending', 'done', 'aborted']).notNullable().defaultTo('pending');
    t.dateTime('completed_at');
    t.string('note', 1000);
    baseColumns(knex, t);
    t.primary(['task_id', 'row_id']);
    t.index(['row_id']);
  });

  // 196 get:row_plan for everyone who can see tasks, 197 edit:row_plan for owners, managers and extension officers.
  // Task-row changes use the existing get:task and edit:task scopes.
  await knex('permissions').insert([
    { permission_id: 196, name: 'get:row_plan', description: 'get row plans' },
    { permission_id: 197, name: 'edit:row_plan', description: 'import and supersede row plans' },
  ]);
  await knex('rolePermissions').insert([
    { role_id: 1, permission_id: 196 },
    { role_id: 2, permission_id: 196 },
    { role_id: 3, permission_id: 196 },
    { role_id: 5, permission_id: 196 },
    { role_id: 1, permission_id: 197 },
    { role_id: 2, permission_id: 197 },
    { role_id: 5, permission_id: 197 },
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex('rolePermissions').whereIn('permission_id', [196, 197]).del();
  await knex('permissions').whereIn('permission_id', [196, 197]).del();
  await knex.schema.dropTable('task_row');
  await knex.schema.dropTable('field_row');
  await knex.schema.dropTable('row_plan');
};
