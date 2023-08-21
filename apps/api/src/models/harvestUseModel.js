/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (harvestUseModel.js) is part of LiteFarm.
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

import Model from './baseFormatModel.js';
import harvestUseTypeModel from './harvestUseTypeModel.js';

class HarvestUse extends Model {
  static get tableName() {
    return 'harvest_use';
  }

  static get idColumn() {
    return 'harvest_use_id';
  }
  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['task_id', 'harvest_use_type_id', 'quantity'],

      properties: {
        harvest_use_id: { type: 'integer' },
        task_id: { type: 'integer' },
        harvest_use_type_id: { type: 'integer' },
        quantity: { type: 'number' },
        quantity_unit: { type: 'string', enum: ['kg', 'mt', 'lb', 't'] },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      harvest_use_type: {
        relation: Model.HasOneRelation,
        modelClass: harvestUseTypeModel,
        join: {
          from: 'harvest_use.harvest_use_type_id',
          to: 'harvest_use_type.harvest_use_type_id',
        },
      },
    };
  }
}

export default HarvestUse;
