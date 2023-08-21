/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (fieldWorkLogModel.js) is part of LiteFarm.
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
import taskModel from './taskModel.js';
import BaseModel from './baseModel.js';
import FieldWorkTypeModel from './fieldWorkTypeModel.js';

class FieldWorkTaskModel extends BaseModel {
  static get tableName() {
    return 'field_work_task';
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
      properties: {
        task_id: { type: 'integer' },
        field_work_type_id: { type: 'integer' },
        ...this.baseProperties,
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
        modelClass: taskModel,
        join: {
          from: 'field_work_task.task_id',
          to: 'task.task_id',
        },
      },
      field_work_task_type: {
        modelClass: FieldWorkTypeModel,
        relation: Model.HasManyRelation,
        join: {
          from: 'field_work_task.field_work_type_id',
          to: 'field_work_type.field_work_type_id',
        },
      },
    };
  }

  // Custom function used in copy crop plan
  // Should contain all jsonSchema() and relationMappings() keys
  static get templateMappingSchema() {
    return {
      // jsonSchema()
      task_id: 'omit',
      field_work_type_id: 'keep',
      // relationMappings
      task: 'omit',
      field_work_task_type: 'omit',
    };
  }
}

export default FieldWorkTaskModel;
