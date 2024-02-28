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
  await knex.schema.createTable('animal_removal_reason', (table) => {
    table.increments('id').primary();
    table.string('key').notNullable();
  });

  const removalReasonKeys = [
    'SOLD',
    'SLAUGHTERED_FOR_SALE',
    'SLAUGHTERED_FOR_CONSUMPTION',
    'NATURAL_DEATH',
    'CULLED',
    'OTHER',
  ];

  for (const key of removalReasonKeys) {
    await knex('animal_removal_reason').insert({
      key,
    });
  }

  for (const tableName of ['animal', 'animal_batch']) {
    await knex.schema.alterTable(tableName, (table) => {
      table.integer('animal_removal_reason_id').references('id').inTable('animal_removal_reason');
      table.string('removal_explanation');
    });
  }

  // Permissions for enum table
  await knex('permissions').insert([
    {
      permission_id: 167,
      name: 'get:animal_removal_reasons',
      description: 'get animal removal reasons',
    },
  ]);

  await knex('rolePermissions').insert([
    { role_id: 1, permission_id: 167 },
    { role_id: 2, permission_id: 167 },
    { role_id: 3, permission_id: 167 },
    { role_id: 5, permission_id: 167 },
  ]);
};

export const down = async function (knex) {
  const permissions = [167];

  await knex('rolePermissions').whereIn('permission_id', permissions).del();
  await knex('permissions').whereIn('permission_id', permissions).del();

  for (const tableName of ['animal', 'animal_batch']) {
    await knex.schema.alterTable(tableName, (table) => {
      table.dropColumn('removal_explanation');
      table.dropColumn('animal_removal_reason_id');
    });
  }

  await knex.schema.dropTable('animal_removal_reason');
};
