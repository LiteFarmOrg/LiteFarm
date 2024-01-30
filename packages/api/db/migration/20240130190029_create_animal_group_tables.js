/*
 *  Copyright (c) 2024 LiteFarm.org
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
  await knex.schema.createTable('animal_group', (table) => {
    table.increments('id').primary();
    table.string('farm_id').notNullable();
    table.string('name').notNullable();
    table.string('notes');
  });

  await knex.schema.createTable('animal_group_relationship', (table) => {
    table.increments('id').primary();
    table.integer('animal_id').references('id').inTable('animal').notNullable();
    table.integer('animal_group_id').references('id').inTable('animal_group').notNullable();
  });

  await knex.schema.createTable('animal_batch_group_relationship', (table) => {
    table.increments('id').primary();
    table.integer('animal_batch_id').references('id').inTable('animal_batch').notNullable();
    table.integer('animal_group_id').references('id').inTable('animal_group').notNullable();
  });

  // Add  permissions
  await knex('permissions').insert([
    { permission_id: 163, name: 'add:animal_groups', description: 'add animal groups' },
    { permission_id: 164, name: 'delete:animal_groups', description: 'delete animal groups' },
    { permission_id: 165, name: 'edit:animal_groups', description: 'edit animal groups' },
    { permission_id: 166, name: 'get:animal_groups', description: 'get animal groups' },
  ]);

  await knex('rolePermissions').insert([
    { role_id: 1, permission_id: 163 },
    { role_id: 2, permission_id: 163 },
    { role_id: 5, permission_id: 163 },
    { role_id: 1, permission_id: 164 },
    { role_id: 2, permission_id: 164 },
    { role_id: 5, permission_id: 164 },
    { role_id: 1, permission_id: 165 },
    { role_id: 2, permission_id: 165 },
    { role_id: 5, permission_id: 165 },
    { role_id: 1, permission_id: 166 },
    { role_id: 2, permission_id: 166 },
    { role_id: 3, permission_id: 166 },
    { role_id: 5, permission_id: 166 },
  ]);
};

export const down = async function (knex) {
  const permissions = [163, 164, 165, 166];

  await knex('rolePermissions').whereIn('permission_id', permissions).del();
  await knex('permissions').whereIn('permission_id', permissions).del();

  await knex.schema.dropTable('animal_group');
  await knex.schema.dropTable('animal_group_relationship');
  await knex.schema.dropTable('animal_batch_group_relationship');
};
