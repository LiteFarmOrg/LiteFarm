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
  await knex.schema.createTable('animal_batch', (table) => {
    table.increments('id').primary();
    table.uuid('farm_id').notNullable().references('farm_id').inTable('farm');
    table.integer('default_type_id').references('id').inTable('default_animal_type');
    table.integer('custom_type_id').references('id').inTable('custom_animal_type');
    table.integer('default_breed_id').references('id').inTable('default_animal_breed');
    table.integer('custom_breed_id').references('id').inTable('custom_animal_breed');
    table.string('name').notNullable();
    table.text('notes').nullable();
    table.integer('count').notNullable();
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
      ['default_type_id', 'custom_type_id'],
      'not_null_type_id_check',
    );
    table.check(
      '?? is null or ?? is null',
      ['default_type_id', 'custom_type_id'],
      'null_type_id_check',
    );
  });

  await knex.schema.createTable('animal_batch_sex_detail', (table) => {
    table.increments('id').primary();
    table.integer('batch_id').notNullable().references('id').inTable('animal_batch');
    table.integer('sex_id').notNullable().references('id').inTable('animal_sex');
    table.integer('count').notNullable();
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
  });
};

export const down = async function (knex) {
  await knex.schema.dropTable('animal_batch_sex_detail');
  await knex.schema.dropTable('animal_batch');
};
