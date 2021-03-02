/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (fieldCropModel.js) is part of LiteFarm.
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
const baseModel = require('./baseModel')
class FieldCrop extends baseModel {
  static get tableName() {
    return 'fieldCrop';
  }

  static get idColumn() {
    return 'field_crop_id';
  }
  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['crop_id', 'location_id', 'area_used', 'estimated_production', 'estimated_revenue'],
      properties: {
        field_crop_id: { type: 'integer' },
        crop_id: { type: 'integer' },
        location_id: { type: 'string' },
        variety: { type: 'string' },
        start_date: { type: 'date-time' },
        end_date: { type: 'date-time' },
        area_used: { type: 'float', minimum: 0 },
        estimated_production: { type: 'float', minimum: 0 },
        estimated_revenue: { type: 'float', minimum: 0 },
        is_by_bed: { type: 'boolean' },
        bed_config: { type: 'object, null' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }
  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      farm: {
        relation: Model.BelongsToOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: require('./fieldModel.js'),
        join: {
          from: 'fieldCrop.location_id',
          to: 'location.farm_id',
        },

      },
      crop:{
        relation: Model.BelongsToOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: require('./cropModel.js'),
        join: {
          from: 'fieldCrop.crop_id',
          to: 'crop.crop_id',
        },

      },
      activityLog:{
        relation:Model.ManyToManyRelation,
        modelClass:require('./activityLogModel.js'),
        join:{
          to: 'activityLog.activity_id',
          through:{
            from:'activityCrops.activity_id',
            to:'activityCrops.field_crop_id',
          },
          from:'fieldCrop.field_crop_id',
        },

      },
      ...this.baseRelationMappings('fieldCrop'),
    };
  }
}

module.exports = FieldCrop;
