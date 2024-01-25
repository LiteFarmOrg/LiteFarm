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
  await knex.schema.createTable('animal_sex', (table) => {
    table.increments('id').primary();
    table.string('key').notNullable();
  });

  await knex.schema.createTable('animal_identifier_color', (table) => {
    table.increments('id').primary();
    table.string('key').notNullable();
  });

  await knex.schema.createTable('animal_identifier_placement', (table) => {
    table.increments('id').primary();
    table.integer('default_type_id').references('id').inTable('default_animal_type').notNullable();
    table.string('key').notNullable();
  });

  await knex.schema.createTable('animal_origin', (table) => {
    table.increments('id').primary();
    table.string('key').notNullable();
  });

  await knex.schema.createTable('animal', (table) => {
    table.increments('id').primary();
    table.uuid('farm_id').notNullable().references('farm_id').inTable('farm');
    table.integer('default_breed_id').references('id').inTable('default_animal_breed');
    table.integer('custom_breed_id').references('id').inTable('custom_animal_breed');
    table.integer('sex_id').references('id').inTable('animal_sex');
    table.string('name');
    table.dateTime('birth_date');
    table.string('identifier');
    table.integer('identifier_color_id').references('id').inTable('animal_identifier_color');
    table
      .integer('identifier_placement_id')
      .references('id')
      .inTable('animal_identifier_placement');
    table.integer('origin_id').references('id').inTable('animal_origin');
    table.string('dam');
    table.string('sire');
    table.dateTime('brought_in_date');
    table.dateTime('weaning_date');
    table.text('notes');
    table.boolean('deleted').notNullable().defaultTo(false);
    table
      .string('created_by_user_id')
      .notNullable()
      .references('user_id')
      .inTable('users')
      .defaultTo(1);
    table
      .string('updated_by_user_id')
      .notNullable()
      .references('user_id')
      .inTable('users')
      .defaultTo(1);
    table.dateTime('created_at').notNullable().defaultTo(new Date('2000/1/1').toISOString());
    table.dateTime('updated_at').notNullable().defaultTo(new Date('2000/1/1').toISOString());
    table.check(
      '?? is null or ?? is null',
      ['default_breed_id', 'custom_breed_id'],
      'null_breed_id_check',
    );
    table.check(
      '?? is not null or ?? is not null',
      ['name', 'identifier'],
      'name_identifier_check',
    );
  });

  // Add enums
  const enumTableKeys = {
    animal_sex: ['MALE', 'FEMALE'],
    animal_identifier_color: ['YELLOW', 'WHITE', 'ORANGE', 'GREEN', 'BLUE', 'RED'],
    animal_origin: ['BROUGHT_IN', 'BORN_AT_FARM'],
  };

  const identifierPlacementKeys = [
    {
      typeKeys: ['CATTLE', 'PIGS'],
      keys: ['LEFT_EAR', 'RIGHT_EAR'],
    },
    {
      typeKeys: ['CHICKEN_BROILERS', 'CHICKEN_LAYERS'],
      keys: ['LEFT_LEG', 'RIGHT_LEG'],
    },
  ];

  let rows = [];

  for (const table in enumTableKeys) {
    rows = [];
    const keys = enumTableKeys[table];

    for (const key of keys) {
      rows.push({
        key,
      });
    }

    await knex(table).insert(rows);
  }

  rows = [];

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
    { permission_id: 151, name: 'add:animals', description: 'add animal breeds' },
    { permission_id: 152, name: 'delete:animals', description: 'delete animal breeds' },
    { permission_id: 153, name: 'edit:animals', description: 'edit animal breeds' },
    { permission_id: 154, name: 'get:animals', description: 'get animal breeds' },
    {
      permission_id: 155,
      name: 'get:animal_identifier_colors',
      description: 'get animal identifier colors',
    },
    {
      permission_id: 156,
      name: 'get:animal_identifier_placements',
      description: 'get animal identifier placements',
    },
    { permission_id: 157, name: 'get:animal_sexes', description: 'get animal sexes' },
    { permission_id: 158, name: 'get:animal_origins', description: 'get animal origins' },
  ]);

  await knex('rolePermissions').insert([
    { role_id: 1, permission_id: 151 },
    { role_id: 2, permission_id: 151 },
    { role_id: 5, permission_id: 151 },
    { role_id: 1, permission_id: 152 },
    { role_id: 2, permission_id: 152 },
    { role_id: 5, permission_id: 152 },
    { role_id: 1, permission_id: 153 },
    { role_id: 2, permission_id: 153 },
    { role_id: 5, permission_id: 153 },
    { role_id: 1, permission_id: 154 },
    { role_id: 2, permission_id: 154 },
    { role_id: 3, permission_id: 154 },
    { role_id: 5, permission_id: 154 },
    { role_id: 1, permission_id: 155 },
    { role_id: 2, permission_id: 155 },
    { role_id: 3, permission_id: 155 },
    { role_id: 5, permission_id: 155 },
    { role_id: 1, permission_id: 156 },
    { role_id: 2, permission_id: 156 },
    { role_id: 3, permission_id: 156 },
    { role_id: 5, permission_id: 156 },
    { role_id: 1, permission_id: 157 },
    { role_id: 2, permission_id: 157 },
    { role_id: 3, permission_id: 157 },
    { role_id: 5, permission_id: 157 },
    { role_id: 1, permission_id: 158 },
    { role_id: 2, permission_id: 158 },
    { role_id: 3, permission_id: 158 },
    { role_id: 5, permission_id: 158 },
  ]);
};

export const down = async function (knex) {
  const permissions = [151, 152, 153, 154, 155, 156, 157, 158];

  await knex('rolePermissions').whereIn('permission_id', permissions).del();
  await knex('permissions').whereIn('permission_id', permissions).del();

  await knex.schema.dropTable('animal');
  await knex.schema.dropTable('animal_sex');
  await knex.schema.dropTable('animal_identifier_color');
  await knex.schema.dropTable('animal_identifier_placement');
  await knex.schema.dropTable('animal_origin');
};
