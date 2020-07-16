/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (20190103120409_update_expense_id_data_type.js) is part of LiteFarm.
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
    knex.schema.table('farmExpenseType', (table) => {
      table.dropColumn('expense_type_id');
    }),
    knex.schema.table('farmExpenseType', (table) => {
      table.uuid('expense_type_id').primary().defaultTo(knex.raw('uuid_generate_v1()'));
    }),
  ])
};

exports.down = function(knex, Promise) {
  return Promise.resolve(
    knex.schema.table('farmExpenseType', (table) => {
      table.dropColumn('expense_type_id');
    })
  ).then(() => {
    return Promise.resolve(
      knex.schema.table('farmExpenseType', (table) => {
        table.increments('expense_type_id').primary();
      }),
    )
  })
};
