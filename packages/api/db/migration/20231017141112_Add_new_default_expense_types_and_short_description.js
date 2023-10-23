/*
 *  Copyright (c) 2023 LiteFarm.org
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

// Use vars to avoid spelling mistakes
const newExpenseTypeNames = ['Utilities', 'Labour', 'Infrastructure', 'Transportation', 'Services'];
const newDefaultExpenseTypes = newExpenseTypeNames.map((val) => {
  return {
    expense_name: val,
    expense_translation_key: val.replace(/\s/g, '_').toUpperCase(),
  };
});
const oldSeeds = 'Seeds';
const oldPesticide = 'Pesticide';
const newSeeds = 'Seeds and Plants';
const newPesticide = 'Pest Control';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  // Add short description to tables
  await knex.schema.alterTable('farmExpenseType', (table) => {
    table.string('custom_description').nullable();
  });
  await knex.schema.alterTable('revenue_type', (table) => {
    table.string('custom_description').nullable();
  });

  // Add new default types
  await knex('farmExpenseType').insert(newDefaultExpenseTypes);

  // Update existing defaults
  await knex('farmExpenseType')
    .where({
      expense_name: oldSeeds,
      farm_id: null,
    })
    .update({
      expense_name: newSeeds,
      expense_translation_key: newSeeds.replace(/\s/g, '_').toUpperCase(),
    });
  await knex('farmExpenseType')
    .where({
      expense_name: oldPesticide,
      farm_id: null,
    })
    .update({
      expense_name: newPesticide,
      expense_translation_key: newPesticide.replace(/\s/g, '_').toUpperCase(),
    });
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.alterTable('farmExpenseType', (table) => {
    table.dropColumn('custom_description');
  });
  await knex.schema.alterTable('revenue_type', (table) => {
    table.dropColumn('custom_description');
  });

  await knex('farmExpenseType')
    .where('farm_id', null)
    .whereIn('expense_name', newExpenseTypeNames)
    .del();
  await knex('farmExpenseType')
    .where({
      expense_name: newSeeds,
      farm_id: null,
    })
    .update({
      expense_name: oldSeeds,
      expense_translation_key: oldSeeds.replace(/\s/g, '_').toUpperCase(),
    });
  await knex('farmExpenseType')
    .where({
      expense_name: newPesticide,
      farm_id: null,
    })
    .update({
      expense_name: oldPesticide,
      expense_translation_key: oldPesticide.replace(/\s/g, '_').toUpperCase(),
    });
};
