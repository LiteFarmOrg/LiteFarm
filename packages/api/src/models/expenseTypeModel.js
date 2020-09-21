/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (expenseTypeModel.js) is part of LiteFarm.
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

const Model = require('objection').Model;
const softDelete = require('objection-soft-delete');

class ExpenseType extends softDelete({columnName: 'deleted'})(Model) {
  static get tableName() {
    return 'farmExpenseType';
  }

  static get idColumn() {
    return 'expense_type_id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['expense_name', 'farm_id'],

      properties: {
        expense_type_id: { type: 'string' },
        expense_name: { type: 'string', minLength: 1, maxLength: 255 },
        farm_id: { type: 'string' },
        deleted: { type: 'boolean' },
      },
    };
  }
}

module.exports = ExpenseType;
