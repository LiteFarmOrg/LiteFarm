/*
 *  Copyright (c) 2026 LiteFarm.org
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

import { addTableEnumConstraintSql, dropTableEnumConstraintSql } from '../util.js';

export const up = async function (knex) {
  // Step 1: Add entity_type column with default 'none'
  await knex.schema.alterTable('revenue_type', (table) => {
    table.string('entity_type').notNullable().defaultTo('none');
  });

  // Step 2: Backfill entity_type for existing crop-generated revenue types
  await knex('revenue_type').where({ crop_generated: true }).update({ entity_type: 'crop' });

  // Step 3: Add CHECK constraint and drop the old columns
  await knex.raw(
    addTableEnumConstraintSql('revenue_type', 'entity_type', ['none', 'crop', 'animal']),
  );
  await knex.schema.alterTable('revenue_type', (table) => {
    table.dropColumn('crop_generated');
    table.dropColumn('agriculture_associated');
  });

  // Step 4: Seed the "Animal sale" system revenue type
  await knex('revenue_type').insert({
    revenue_name: 'Animal Sale',
    farm_id: null,
    deleted: false,
    retired: false,
    created_by_user_id: '1',
    updated_by_user_id: '1',
    created_at: new Date('2000/1/1').toISOString(),
    updated_at: new Date('2000/1/1').toISOString(),
    revenue_translation_key: 'ANIMAL_SALE',
    entity_type: 'animal',
  });

  // Step 5: Create animal_sale junction table
  await knex.schema.createTable('animal_sale', (table) => {
    table.increments('id').primary();
    table
      .integer('sale_id')
      .notNullable()
      .references('sale_id')
      .inTable('sale')
      .onDelete('CASCADE');
    table.integer('animal_id').nullable().references('id').inTable('animal');
    table.integer('animal_batch_id').nullable().references('id').inTable('animal_batch');
    table.float('quantity');
    table.enu('quantity_unit', ['kg', 'mt', 'lb', 't']).defaultTo('kg');
    table.float('sale_value');
    table.check(
      `(animal_id IS NOT NULL AND animal_batch_id IS NULL) OR (animal_id IS NULL AND animal_batch_id IS NOT NULL)`,
      [],
      'animal_sale_entity_check',
    );
  });
};

export const down = async function (knex) {
  // Step 1: Drop animal_sale table
  await knex.schema.dropTable('animal_sale');

  // Step 2: Remove the "Animal sale" system revenue type
  await knex('revenue_type').where({ revenue_translation_key: 'ANIMAL_SALE', farm_id: null }).del();

  // Step 3: Restore crop_generated and agriculture_associated columns
  await knex.schema.alterTable('revenue_type', (table) => {
    table.boolean('crop_generated').defaultTo(false);
    table.boolean('agriculture_associated').defaultTo(null);
  });

  // Step 4: Restore crop_generated data from entity_type
  await knex('revenue_type').where({ entity_type: 'crop' }).update({ crop_generated: true });

  // Step 5: Drop entity_type CHECK constraint and column
  await knex.raw(dropTableEnumConstraintSql('revenue_type', 'entity_type'));
  await knex.schema.alterTable('revenue_type', (table) => {
    table.dropColumn('entity_type');
  });
};
