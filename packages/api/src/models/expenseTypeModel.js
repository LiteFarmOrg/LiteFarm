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

import baseModel from './baseModel.js';

class ExpenseType extends baseModel {
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
        expense_translation_key: { type: 'string' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  /**
   * Check if records exists in DB
   * @param {number} farm_id
   * @param {String} expense_name
   * @param {number} expense_type_id - Expesnse type id to be excluded while checking records
   * @static
   * @async
   * @returns {String} - Object DB record
   */
  static async existsInFarm(farm_id, expense_name, expense_type_id = '') {
    let query = this.query().context({ showHidden: true }).where({
      expense_name,
      farm_id,
    });

    if (expense_type_id) {
      query = query.whereNot({ expense_type_id });
    }

    return query.first();
  }
}

export default ExpenseType;
