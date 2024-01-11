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
  await knex.schema.createTable('animal_breed', (table) => {
    table.increments('id').primary();
    table.uuid('farm_id').references('farm_id').inTable('farm').defaultTo(null);
    table.integer('type_id').references('id').inTable('animal_type').notNullable();
    table.string('breed').defaultTo(null);
    table.string('breed_key').defaultTo(null);
    table.boolean('deleted').notNullable().defaultTo(false);
    table.string('created_by_user_id').references('user_id').inTable('users');
    table.string('updated_by_user_id').references('user_id').inTable('users');
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
    table.check('?? is not null or ?? is not null', ['breed', 'breed_key']);
  });

  // Add initial default breeds
  const defaultBreedKeys = [
    {
      typeId: 1,
      breedKeys: ['ANGUS', 'HEREFORD', 'CHAROLAIS'],
    },
    {
      typeId: 2,
      breedKeys: ['YORKSHIRE_LARGE_WHITE', 'LANDRACE', 'DUROC'],
    },
    {
      typeId: 3,
      breedKeys: ['CORNISH_CROSS', 'ROSS_308', 'COBB_500'],
    },
    {
      typeId: 4,
      breedKeys: ['LEGHORN', 'RHODE_ISLAND_RED', 'PLYMOUTH_ROCK'],
    },
  ];

  const rows = [];

  defaultBreedKeys.forEach(({ typeId, breedKeys }) =>
    breedKeys.forEach((breedKey) =>
      rows.push({
        farm_id: null,
        type_id: typeId,
        breed: null, // only provide for user-created types (i.e. without translation keys)
        breed_key: breedKey,
        deleted: false,
        created_by_user_id: '1',
        updated_by_user_id: '1',
        created_at: new Date('2000/1/1').toISOString(),
        updated_at: new Date('2000/1/1').toISOString(),
      }),
    ),
  );

  await knex('animal_breed').insert(rows);

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

  await knex.schema.dropTable('animal_breed');
};
