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
  // Sexes that are allowed to be used for reproduction
  const maleSex = await knex('animal_sex').select('*').where({ key: 'MALE' }).first();
  // TODO: revisit after LF-4170 placement -> type
  // const otherIdentifierType = await knex('animal_identifier_placement').select('*').where({ key: 'OTHER' }).first();

  await knex.schema.alterTable('animal', (table) => {
    table.boolean('used_for_reproduction').nullable();
    table.check(
      `(used_for_reproduction IS NOT NULL AND (sex_id = ${maleSex.id})) OR used_for_reproduction IS NULL`,
      [],
      'reproduction_sex_check',
    );
    // TODO: revisit after LF-4170 placement -> type
    table
      .integer('identifier_type_id')
      .references('id')
      .inTable('animal_identifier_placement')
      .nullable();
    table.string('identifier_type_other').nullable();
    // table.check(
    //   `(identifier_type_other IS NOT NULL AND identifier_type_id = ${otherIdentifierType.id}) OR (identifier_type_other IS NULL)`,
    //   [],
    //   'identifier_type_other_id_check',
    // );
    table
      .enu('organic_status', ['Non-Organic', 'Transitional', 'Organic'])
      .notNullable()
      .defaultTo('Non-Organic');
    table.string('supplier').nullable();
    table.float('price').unsigned().nullable();
  });

  const otherUse = await knex('animal_use').select('*').where({ key: 'OTHER' }).first();

  await knex.schema.createTable('animal_use_relationship', (table) => {
    table.increments('id').primary();
    table.integer('animal_id').references('id').inTable('animal').notNullable();
    table.integer('use_id').references('id').inTable('animal_use').notNullable();
    table.string('other_use');
    table.unique(['animal_id', 'use_id'], {
      indexName: 'animal_use_uniqueness_check',
    });
    table.check(
      `(other_use IS NOT NULL AND use_id = ${otherUse.id}) OR (other_use IS NULL)`,
      [],
      'other_use_id_check',
    );
  });

  await knex.schema.alterTable('animal_batch', (table) => {
    table
      .enu('organic_status', ['Non-Organic', 'Transitional', 'Organic'])
      .notNullable()
      .defaultTo('Non-Organic');
    table.string('supplier').nullable();
    table.float('price').unsigned().nullable();
    table.string('dam').nullable();
    table.string('sire').nullable();
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('animal', (table) => {
    // TODO: revisit after LF-4170
    // table.dropChecks(['reproduction_sex_check', 'identifier_type_other_id_check']);
    table.dropChecks(['reproduction_sex_check']);
    table.dropColumns([
      'used_for_reproduction',
      'identifier_type_id',
      'identifier_type_other',
      'organic_status',
      'supplier',
      'price',
    ]);
  });

  await knex.schema.dropTable('animal_use_relationship');

  await knex.schema.alterTable('animal_batch', (table) => {
    table.dropColumns(['organic_status', 'supplier', 'price', 'dam', 'sire']);
  });
};
