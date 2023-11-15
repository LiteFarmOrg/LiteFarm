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

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.alterTable('revenue_type', (table) => {
    table.boolean('retired').defaultTo(false);
  });

  await knex.schema.alterTable('farmExpenseType', (table) => {
    table.boolean('retired').defaultTo(false);
  });

  /* Data migrations to retire deleted types with associated records
   **
   This will only only affect types on beta and local environments! There are no custom types on production!**
   **
   */

  // Data migration for revenue_type
  const revenueTypeIds = await knex('sale')
    .select('revenue_type_id')
    .where('deleted', false)
    .whereIn('revenue_type_id', function () {
      this.select('revenue_type_id')
        .from('revenue_type')
        .whereNotNull('farm_id')
        .andWhere('deleted', true);
    });

  await knex('revenue_type')
    .whereIn(
      'revenue_type_id',
      revenueTypeIds.map((rt) => rt.revenue_type_id),
    )
    .update({
      deleted: false,
      retired: true,
    });

  // Data migration for farmExpenseType
  const expenseTypeIds = await knex('farmExpense')
    .select('expense_type_id')
    .where('deleted', false)
    .whereIn('expense_type_id', function () {
      this.select('expense_type_id')
        .from('farmExpenseType')
        .whereNotNull('farm_id')
        .andWhere('deleted', true);
    });

  await knex('farmExpenseType')
    .whereIn(
      'expense_type_id',
      expenseTypeIds.map((et) => et.expense_type_id),
    )
    .update({
      deleted: false,
      retired: true,
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  // Reverting data migration for revenue_type
  await knex('revenue_type').where('retired', true).update({
    deleted: true,
  });

  // Reverting data migration for farmExpenseType
  await knex('farmExpenseType').where('retired', true).update({
    deleted: true,
  });

  await knex.schema.alterTable('revenue_type', (table) => {
    table.dropColumn('retired');
  });

  await knex.schema.alterTable('farmExpenseType', (table) => {
    table.dropColumn('retired');
  });
};
