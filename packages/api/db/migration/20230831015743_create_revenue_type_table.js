/*
 *  Copyright (c) 2023 LiteFarm.org
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
  await knex.schema.createTable('revenue_type', (table) => {
    table.increments('revenue_type_id').primary();
    table.string('revenue_name').notNullable();
    table.uuid('farm_id').references('farm_id').inTable('farm').defaultTo(null);
    table.boolean('deleted').notNullable().defaultTo(false);
    table.string('created_by_user_id').references('user_id').inTable('users');
    table.string('updated_by_user_id').references('user_id').inTable('users');
    table.dateTime('created_at').notNullable();
    table.dateTime('updated_at').notNullable();
    table.string('revenue_translation_key').notNullable();
  });

  await knex.schema.alterTable('sale', (table) => {
    table.integer('revenue_type_id').references('revenue_type_id').inTable('revenue_type');
  });

  // Prepopulate with one revenue type (crop_sale)
  await knex('revenue_type').insert({
    revenue_type_id: 1,
    revenue_name: 'crop_sale',
    farm_id: null,
    deleted: false,
    created_by_user_id: '1',
    updated_by_user_id: '1',
    created_at: new Date('2000/1/1').toISOString(),
    updated_at: new Date('2000/1/1').toISOString(),
    revenue_translation_key: 'CROP_SALE',
  });

  // Reference crop_sale type for all existing records
  await knex('sale').update({ revenue_type_id: 1 });

  // Add  permissions
  await knex('permissions').insert([
    { permission_id: 138, name: 'add:revenue_types', description: 'add revenue types' },
    { permission_id: 139, name: 'delete:revenue_types', description: 'delete revenue types' },
    { permission_id: 140, name: 'edit:revenue_types', description: 'edit revenue types' },
    { permission_id: 141, name: 'get:revenue_types', description: 'get revenue types' },
  ]);

  await knex('rolePermissions').insert([
    { role_id: 1, permission_id: 138 },
    { role_id: 2, permission_id: 138 },
    { role_id: 5, permission_id: 138 },
    { role_id: 1, permission_id: 139 },
    { role_id: 2, permission_id: 139 },
    { role_id: 5, permission_id: 139 },
    { role_id: 1, permission_id: 140 },
    { role_id: 2, permission_id: 140 },
    { role_id: 5, permission_id: 140 },
    { role_id: 1, permission_id: 141 },
    { role_id: 2, permission_id: 141 },
    { role_id: 3, permission_id: 141 },
    { role_id: 5, permission_id: 141 },
  ]);
};

export const down = async function (knex) {
  const permissions = [138, 139, 140, 141];

  await knex('rolePermissions').whereIn('permission_id', permissions).del();
  await knex('permissions').whereIn('permission_id', permissions).del();

  await knex.schema.alterTable('sale', (table) => {
    table.dropColumn('revenue_type_id');
  });

  await knex.schema.dropTable('revenue_type');
};
