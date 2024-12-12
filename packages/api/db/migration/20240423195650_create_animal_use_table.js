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
  await knex.schema.createTable('animal_use', (table) => {
    table.increments('id').primary();
    table.string('key').notNullable();
  });

  const uses = [
    'MILK',
    'EGGS',
    'FAT',
    'MEAT',
    'ANIMAL_FIBERS_AND_SKINS',
    'LABOUR_AND_DRAFT',
    'BREEDING',
    'RECREATIONAL_OR_CULTURAL_USE',
    'COMPANIONSHIP',
    'OTHER',
  ];

  const rows = uses.map((use) => ({ key: use }));
  await knex('animal_use').insert(rows);

  const usesData = await knex('animal_use');
  const usesKeyIdMap = usesData.reduce((map, row) => {
    map[row.key] = row.id;
    return map;
  }, {});

  await knex.schema.createTable('animal_type_use_relationship', (table) => {
    table.integer('default_type_id').references('id').inTable('default_animal_type').notNullable();
    table.integer('animal_use_id').references('id').inTable('animal_use').notNullable();
  });

  const typeUsesRelathionships = [
    [
      'CATTLE',
      [
        'MILK',
        'FAT',
        'MEAT',
        'ANIMAL_FIBERS_AND_SKINS',
        'LABOUR_AND_DRAFT',
        'BREEDING',
        'RECREATIONAL_OR_CULTURAL_USE',
        'COMPANIONSHIP',
        'OTHER',
      ],
    ],
    [
      'PIGS',
      [
        'FAT',
        'MEAT',
        'ANIMAL_FIBERS_AND_SKINS',
        'LABOUR_AND_DRAFT',
        'BREEDING',
        'RECREATIONAL_OR_CULTURAL_USE',
        'COMPANIONSHIP',
        'OTHER',
      ],
    ],
    [
      'CHICKEN',
      [
        'EGGS',
        'FAT',
        'MEAT',
        'ANIMAL_FIBERS_AND_SKINS',
        'BREEDING',
        'RECREATIONAL_OR_CULTURAL_USE',
        'COMPANIONSHIP',
        'OTHER',
      ],
    ],
  ];

  for (const [type, uses] of typeUsesRelathionships) {
    const rows = [];
    const [typeId] = await knex('default_animal_type').where({ key: type }).pluck('id');

    for (const use of uses) {
      const useId = usesKeyIdMap[use];
      rows.push({ default_type_id: typeId, animal_use_id: useId });
    }

    await knex('animal_type_use_relationship').insert(rows);
  }

  await knex('permissions').insert([
    { permission_id: 168, name: 'get:animal_uses', description: 'get animal uses' },
  ]);
  await knex('rolePermissions').insert([
    { role_id: 1, permission_id: 168 },
    { role_id: 2, permission_id: 168 },
    { role_id: 3, permission_id: 168 },
    { role_id: 5, permission_id: 168 },
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex('rolePermissions').where('permission_id', 168).del();
  await knex('permissions').where('permission_id', 168).del();

  await knex.schema.dropTable('animal_type_use_relationship');
  await knex.schema.dropTable('animal_use');
};
