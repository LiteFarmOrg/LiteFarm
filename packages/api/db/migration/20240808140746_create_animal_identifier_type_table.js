/*
 *  Copyright 2024 LiteFarm.org
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
const PERMISSION_NAME = 'get:animal_identifier_types';

export const up = async function (knex) {
  await knex.schema.createTable('animal_identifier_type', (table) => {
    table.increments('id').primary();
    table.string('key').notNullable();
  });

  await knex('animal_identifier_type').insert([
    { key: 'EAR_TAG' },
    { key: 'LEG_BAND' },
    { key: 'OTHER' },
  ]);

  await knex('permissions').insert({
    permission_id: 171,
    name: PERMISSION_NAME,
    description: 'get animal identifier types',
  });

  await knex('rolePermissions').insert(
    [1, 2, 3, 5].map((role_id) => ({ role_id, permission_id: 171 })),
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const down = async function (knex) {
  await knex.schema.dropTable('animal_identifier_type');

  await knex.raw(`
        DELETE FROM "rolePermissions" rp
        USING permissions p
        WHERE rp.permission_id = p.permission_id 
        AND p.name = '${PERMISSION_NAME}'
      `);

  await knex('permissions').where('name', PERMISSION_NAME).del();
};
