/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (20190103113052_delete_column_in_farm_expense.js) is part of LiteFarm.
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

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('farmExpense', (table) => {
      table.dropColumn('expense_type_id');
    }),
    knex.schema.table('farmExpenseType', (table) => {
      table.dropColumn('expense_type_id');
      table.dropColumn('user_added');
    }),
    knex.schema.table('farmExpenseType', (table) => {
      table.uuid('expense_type_id').primary();
      table.uuid('farm_id').references('farm_id').inTable('farm').onDelete('CASCADE');
    }),
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('farmExpenseType', (table) => {
      table.dropColumn('expense_type_id');
      table.dropColumn('farm_id');
    }),
  ]).then(() => {
    return Promise.all([
      knex.schema.table('farmExpenseType', (table) => {
        table.boolean('user_added');
        table.increments('expense_type_id').primary();
      }),
    ])
  })
};
