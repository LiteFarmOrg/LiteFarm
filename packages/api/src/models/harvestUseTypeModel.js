/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (harvestLogModel.js) is part of LiteFarm.
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

import { Model } from 'objection';
import harvestTaskModel from './harvestTaskModel.js';
import harvestUseModel from './harvestUseModel.js';

class HarvestUseType extends Model {
  static get tableName() {
    return 'harvest_use_type';
  }

  static get idColumn() {
    return 'harvest_use_type_id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['harvest_use_type_name'],

      properties: {
        harvest_use_type_id: { type: 'integer' },
        harvest_use_type_name: { type: 'string' },
        farm_id: { type: 'string' },
        harvest_use_type_translation_key: { type: 'string' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      harvestTask: {
        modelClass: harvestTaskModel,
        relation: Model.ManyToManyRelation,

        join: {
          from: 'harvest_use_type.harvest_use_type_id',
          through: {
            modelClass: harvestUseModel,
            from: 'harvest_use.task_id',
            to: 'harvest_use.harvest_use_type_id',
          },

          to: 'harvest_task.task_id',
        },
      },
    };
  }
}

export default HarvestUseType;
