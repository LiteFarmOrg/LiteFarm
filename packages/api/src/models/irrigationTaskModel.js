/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (irrigationLogModel.js) is part of LiteFarm.
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

class IrrigationTaskModel extends Model {
  static get tableName() {
    return 'irrigation_task';
  }

  static get idColumn() {
    return 'task_id';
  }
  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['type'],

      properties: {
        task_id: { type: 'integer' },
        type: {
          type: 'string',
          enum:['sprinkler', 'drip', 'subsurface', 'flood'],

        },
        'flow_rate_l/min': {
          type: 'float',
        },
        hours: {
          type: 'float',
        },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      task: {
        relation: Model.BelongsToOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: require('./taskModel'),
        join: {
          from: 'irrigation_task.task_id',
          to: 'task.task_id',
        },

      },

    };
  }
}

module.exports = IrrigationTaskModel;
