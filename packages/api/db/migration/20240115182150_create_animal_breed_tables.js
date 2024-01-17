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
  await knex.schema.createTable('default_animal_breed', (table) => {
    table.increments('id').primary();
    table.integer('default_type_id').notNullable().references('id').inTable('default_animal_type');
    table.string('key').notNullable();
  });

  await knex.schema.createTable('custom_animal_breed', (table) => {
    table.increments('id').primary();
    table.uuid('farm_id').notNullable().references('farm_id').inTable('farm');
    table.integer('default_type_id').references('id').inTable('default_animal_type');
    table.integer('custom_type_id').references('id').inTable('custom_animal_type');
    table.string('breed').notNullable();
    table.boolean('deleted').notNullable().defaultTo(false);
    table.string('created_by_user_id').references('user_id').inTable('users');
    table.string('updated_by_user_id').references('user_id').inTable('users');
    table.dateTime('created_at').notNullable().defaultTo(new Date('2000/1/1').toISOString());
    table.dateTime('updated_at').notNullable().defaultTo(new Date('2000/1/1').toISOString());
    table.check(
      '?? is not null or ?? is not null',
      ['default_type_id', 'custom_type_id'],
      'type_id_check',
    );
  });

  // Add initial default breeds
  const defaultBreedKeys = [
    {
      typeKey: 'CATTLE',
      breedKeys: ['ANGUS', 'HEREFORD', 'CHAROLAIS'],
    },
    {
      typeKey: 'PIGS',
      breedKeys: ['YORKSHIRE_LARGE_WHITE', 'LANDRACE', 'DUROC'],
    },
    {
      typeKey: 'CHICKEN_BROILERS',
      breedKeys: ['CORNISH_CROSS', 'ROSS_308', 'COBB_500'],
    },
    {
      typeKey: 'CHICKEN_LAYERS',
      breedKeys: ['LEGHORN', 'RHODE_ISLAND_RED', 'PLYMOUTH_ROCK'],
    },
  ];

  const rows = [];

  for (const entry of defaultBreedKeys) {
    const { typeKey, breedKeys } = entry;
    const { id: typeId } = await knex('default_animal_type').where('key', typeKey).first();
    breedKeys.forEach((breedKey) =>
      rows.push({
        default_type_id: typeId,
        key: breedKey,
      }),
    );
  }

  await knex('default_animal_breed').insert(rows);

  // Add  permissions
  await knex('permissions').insert([
    { permission_id: 147, name: 'add:animal_breeds', description: 'add animal breeds' },
    { permission_id: 148, name: 'delete:animal_breeds', description: 'delete animal breeds' },
    { permission_id: 149, name: 'edit:animal_breeds', description: 'edit animal breeds' },
    { permission_id: 150, name: 'get:animal_breeds', description: 'get animal breeds' },
  ]);

  await knex('rolePermissions').insert([
    { role_id: 1, permission_id: 147 },
    { role_id: 2, permission_id: 147 },
    { role_id: 5, permission_id: 147 },
    { role_id: 1, permission_id: 148 },
    { role_id: 2, permission_id: 148 },
    { role_id: 5, permission_id: 148 },
    { role_id: 1, permission_id: 149 },
    { role_id: 2, permission_id: 149 },
    { role_id: 5, permission_id: 149 },
    { role_id: 1, permission_id: 150 },
    { role_id: 2, permission_id: 150 },
    { role_id: 3, permission_id: 150 },
    { role_id: 5, permission_id: 150 },
  ]);
};

export const down = async function (knex) {
  const permissions = [147, 148, 149, 150];

  await knex('rolePermissions').whereIn('permission_id', permissions).del();
  await knex('permissions').whereIn('permission_id', permissions).del();

  await knex.schema.dropTable('default_animal_breed');
  await knex.schema.dropTable('custom_animal_breed');
};
