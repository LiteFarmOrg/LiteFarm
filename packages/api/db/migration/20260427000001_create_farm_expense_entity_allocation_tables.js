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

export const up = async function (knex) {
  await knex.schema.createTable('farm_expense_crop_variety', (table) => {
    table
      .uuid('farm_expense_id')
      .notNullable()
      .references('farm_expense_id')
      .inTable('farmExpense');
    table
      .uuid('crop_variety_id')
      .notNullable()
      .references('crop_variety_id')
      .inTable('crop_variety');
    table.float('allocated_value').notNullable();
    table.primary(['farm_expense_id', 'crop_variety_id']);
  });

  await knex.schema.createTable('farm_expense_animal', (table) => {
    table.increments('id').primary();
    table
      .uuid('farm_expense_id')
      .notNullable()
      .references('farm_expense_id')
      .inTable('farmExpense');
    table.integer('animal_id').nullable().references('id').inTable('animal');
    table.integer('animal_batch_id').nullable().references('id').inTable('animal_batch');
    table.float('allocated_value').notNullable();
    table.check(
      `(animal_id IS NOT NULL AND animal_batch_id IS NULL) OR (animal_id IS NULL AND animal_batch_id IS NOT NULL)`,
      [],
      'farm_expense_animal_entity_check',
    );
  });
};

export const down = async function (knex) {
  await knex.schema.dropTable('farm_expense_animal');
  await knex.schema.dropTable('farm_expense_crop_variety');
};
