/*
 *  Copyright 2026 LiteFarm.org
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

import BaseFormatModel from './baseFormatModel.js';
import farmExpenseModel from './farmExpenseModel.js';
import cropVarietyModel from './cropVarietyModel.js';

class FarmExpenseCropVariety extends BaseFormatModel {
  static get tableName() {
    return 'farm_expense_crop_variety';
  }

  static get idColumn() {
    return ['farm_expense_id', 'crop_variety_id'];
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['farm_expense_id', 'crop_variety_id', 'allocated_value'],
      properties: {
        farm_expense_id: { type: 'string' },
        crop_variety_id: { type: 'string' },
        allocated_value: { type: 'number' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      farm_expense: {
        relation: BaseFormatModel.BelongsToOneRelation,
        modelClass: farmExpenseModel,
        join: {
          from: 'farm_expense_crop_variety.farm_expense_id',
          to: 'farmExpense.farm_expense_id',
        },
      },
      crop_variety: {
        relation: BaseFormatModel.BelongsToOneRelation,
        modelClass: cropVarietyModel,
        join: {
          from: 'farm_expense_crop_variety.crop_variety_id',
          to: 'crop_variety.crop_variety_id',
        },
      },
    };
  }
}

export default FarmExpenseCropVariety;
