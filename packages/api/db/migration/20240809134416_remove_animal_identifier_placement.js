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

export const up = async function (knex) {
  await knex.schema.alterTable('animal', (table) => {
    table.dropColumn('identifier_placement_id');
  });

  await knex.schema.dropTable('animal_identifier_placement');

  await knex('rolePermissions').where('permission_id', 156).del();
  await knex('permissions').where('permission_id', 156).del();
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const down = async function (knex) {
  // Copied (approximately) from /LiteFarm/packages/api/db/migration/20240116175706_create_animal_tables.js
  await knex.schema.createTable('animal_identifier_placement', (table) => {
    table.increments('id').primary();
    table.integer('default_type_id').references('id').inTable('default_animal_type').notNullable();
    table.string('key').notNullable();
  });

  await knex.schema.alterTable('animal', (table) => {
    table
      .integer('identifier_placement_id')
      .references('id')
      .inTable('animal_identifier_placement');
  });

  const identifierPlacementKeys = [
    {
      typeKeys: ['CATTLE', 'PIGS'],
      keys: ['LEFT_EAR', 'RIGHT_EAR'],
    },
    {
      typeKeys: ['CHICKEN'],
      keys: ['LEFT_LEG', 'RIGHT_LEG'],
    },
  ];

  const rows = [];

  for (const entry of identifierPlacementKeys) {
    const { typeKeys, keys } = entry;

    for (const typeKey of typeKeys) {
      const { id: typeId } = await knex('default_animal_type').where('key', typeKey).first();

      for (const key of keys) {
        rows.push({
          default_type_id: typeId,
          key,
        });
      }
    }
  }

  await knex('animal_identifier_placement').insert(rows);

  // Add  permissions
  await knex('permissions').insert([
    {
      permission_id: 156,
      name: 'get:animal_identifier_placements',
      description: 'get animal identifier placements',
    },
  ]);

  await knex('rolePermissions').insert(
    [1, 2, 3, 5].map((role_id) => ({ role_id, permission_id: 156 })),
  );
};
