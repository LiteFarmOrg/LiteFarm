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
  await knex.schema.createTable('animal_type', (table) => {
    table.increments('id').primary();
    table.uuid('farm_id').references('farm_id').inTable('farm').defaultTo(null);
    table.string('type').defaultTo(null);
    table.string('type_key').defaultTo(null);
    table.boolean('deleted').notNullable().defaultTo(false);
    table.string('created_by_user_id').references('user_id').inTable('users');
    table.string('updated_by_user_id').references('user_id').inTable('users');
    table.dateTime('created_at').notNullable();
    table.dateTime('updated_at').notNullable();
  });

  // Add initial default types
  const defaultTypeKeys = ['CATTLE', 'PIGS', 'CHICKEN_BROILERS', 'CHICKEN_LAYERS'];

  for (const typeKey of defaultTypeKeys) {
    await knex('animal_type').insert({
      farm_id: null,
      type: null, // only provide for user-created types (i.e. without translation keys)
      type_key: typeKey,
      deleted: false,
      created_by_user_id: '1',
      updated_by_user_id: '1',
      created_at: new Date('2000/1/1').toISOString(),
      updated_at: new Date('2000/1/1').toISOString(),
    });
  }

  // Add  permissions
  await knex('permissions').insert([
    { permission_id: 143, name: 'add:animal_types', description: 'add animal types' },
    { permission_id: 144, name: 'delete:animal_types', description: 'delete animal types' },
    { permission_id: 145, name: 'edit:animal_types', description: 'edit animal types' },
    { permission_id: 146, name: 'get:animal_types', description: 'get animal types' },
  ]);

  await knex('rolePermissions').insert([
    { role_id: 1, permission_id: 143 },
    { role_id: 2, permission_id: 143 },
    { role_id: 5, permission_id: 143 },
    { role_id: 1, permission_id: 144 },
    { role_id: 2, permission_id: 144 },
    { role_id: 5, permission_id: 144 },
    { role_id: 1, permission_id: 145 },
    { role_id: 2, permission_id: 145 },
    { role_id: 5, permission_id: 145 },
    { role_id: 1, permission_id: 146 },
    { role_id: 2, permission_id: 146 },
    { role_id: 3, permission_id: 146 },
    { role_id: 5, permission_id: 146 },
  ]);
};

export const down = async function (knex) {
  const permissions = [143, 144, 145, 146];

  await knex('rolePermissions').whereIn('permission_id', permissions).del();
  await knex('permissions').whereIn('permission_id', permissions).del();

  await knex.schema.dropTable('animal_type');
};
