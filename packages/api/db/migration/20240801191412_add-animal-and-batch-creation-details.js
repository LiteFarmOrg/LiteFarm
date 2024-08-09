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
  const otherUse = await knex('animal_use').select('*').where({ key: 'OTHER' }).first();
  const otherIdentifierType = await knex('animal_identifier_type')
    .select('*')
    .where({ key: 'OTHER' })
    .first();

  /*----------------------------------------
   Update animal with new details
  ----------------------------------------*/
  await knex.schema.alterTable('animal', (table) => {
    // TODO: revisit after LF-4170 placement -> type
    table
      .integer('identifier_type_id')
      .references('id')
      .inTable('animal_identifier_placement')
      .nullable();
    table.string('identifier_type_other').nullable();
    table.check(
      `(identifier_type_other IS NOT NULL AND identifier_type_id = ${otherIdentifierType.id}) OR (identifier_type_other IS NULL)`,
      [],
      'identifier_type_other_id_check',
    );
    table
      .enu('organic_status', ['Non-Organic', 'Transitional', 'Organic'])
      .notNullable()
      .defaultTo('Non-Organic');
    table.string('supplier').nullable();
    table.float('price').unsigned().nullable();
  });

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

  /*----------------------------------------
   Update animal batch with new details
  ----------------------------------------*/
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

  await knex.schema.createTable('animal_batch_use_relationship', (table) => {
    table.increments('id').primary();
    table.integer('animal_batch_id').references('id').inTable('animal_batch').notNullable();
    table.integer('use_id').references('id').inTable('animal_use').notNullable();
    table.string('other_use');
    table.unique(['animal_batch_id', 'use_id'], {
      indexName: 'animal_batch_use_uniqueness_check',
    });
    table.check(
      `(other_use IS NOT NULL AND use_id = ${otherUse.id}) OR (other_use IS NULL)`,
      [],
      'other_use_id_check',
    );
  });
};

export const down = async function (knex) {
  /*----------------------------------------
   Undo: Update animal with new details
  ----------------------------------------*/
  await knex.schema.alterTable('animal', (table) => {
    table.dropChecks(['identifier_type_other_id_check']);
    table.dropColumns([
      'identifier_type_id',
      'identifier_type_other',
      'organic_status',
      'supplier',
      'price',
    ]);
  });

  await knex.schema.dropTable('animal_use_relationship');

  /*----------------------------------------
   Undo: Update animal batch with new details
  ----------------------------------------*/
  await knex.schema.alterTable('animal_batch', (table) => {
    table.dropColumns(['organic_status', 'supplier', 'price', 'dam', 'sire']);
  });

  await knex.schema.dropTable('animal_batch_use_relationship');
};
