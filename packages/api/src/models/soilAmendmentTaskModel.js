/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (fertilizerLogModel.js) is part of LiteFarm.
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
import taskModel from './taskModel.js';
import soilAmendmentMethodModel from './soilAmendmentMethodModel.js';

const furrowHoleDepthUnits = ['cm', 'in'];
class SoilAmendmentTaskModel extends Model {
  static get tableName() {
    return 'soil_amendment_task';
  }

  static get idColumn() {
    return 'task_id';
  }

  async $beforeUpdate(queryContext) {
    await super.$beforeUpdate(queryContext);

    if (this.method_id) {
      const { key } = await soilAmendmentMethodModel
        .query(queryContext.transaction)
        .findById(this.method_id)
        .select('key')
        .first();

      if (key !== 'OTHER') {
        this.other_application_method = null;
      }

      if (key !== 'FURROW_HOLE') {
        this.furrow_hole_depth = null;
        this.furrow_hole_depth_unit = null;
      }
    }
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['method_id'],
      properties: {
        task_id: { type: 'integer' },
        method_id: { type: ['integer', 'null'] },
        furrow_hole_depth: { type: ['number', 'null'] },
        furrow_hole_depth_unit: {
          type: ['string', 'null'],
          enum: [...furrowHoleDepthUnits, null],
        },
        other_application_method: { type: ['string', 'null'], minLength: 1, maxLength: 255 },
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
          from: 'soil_amendment_task.task_id',
          to: 'task.task_id',
        },
      },
      method: {
        relation: Model.BelongsToOneRelation,
        modelClass: soilAmendmentMethodModel,
        join: {
          from: 'soil_amendment_task.method_id',
          to: 'soil_amendment_method.id',
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
      method_id: 'keep',
      furrow_hole_depth: 'keep',
      furrow_hole_depth_unit: 'keep',
      other_application_method: 'keep',
      // relationMappings
      task: 'omit',
      product: 'omit',
      method: 'omit',
    };
  }
}

export default SoilAmendmentTaskModel;
