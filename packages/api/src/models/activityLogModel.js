/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (activityLogModel.js) is part of LiteFarm.
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
const BaseModel = require('./baseModel');

// const FertilizerLogModel = require('./fertilizerLogModel');
class activityLogModel extends BaseModel {
  static get tableName() {
    return 'activityLog';
  }

  static get idColumn() {
    return 'activity_id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['activity_kind', 'date'],

      properties: {
        activity_id: { type: 'integer' },
        activity_kind: { type: 'string', enum:['fertilizing', 'pestControl', 'scouting', 'irrigation', 'harvest', 'seeding', 'fieldWork', 'weatherData', 'soilData', 'other'] },
        date: { type: 'date-time' },
        notes: { type: 'string' },
        action_needed: { type: 'boolean' },
        user_id: { type: 'string' },
        ...super.baseProperties,
      },
      additionalProperties: false,
    };
  }
  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      fertilizerLog: {
        relation: Model.HasOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: require('./fertilizerLogModel'),
        join: {
          from: 'activityLog.activity_id',
          to: 'fertilizerLog.activity_id',
        },
      },
      pestControlLog: {
        relation: Model.HasOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: require('./pestControlLogModel'),
        join: {
          from: 'activityLog.activity_id',
          to: 'pestControlLog.activity_id',
        },
      },
      irrigationLog: {
        relation: Model.HasOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: require('./irrigationLogModel'),
        join: {
          from: 'activityLog.activity_id',
          to: 'irrigationLog.activity_id',
        },
      },
      scoutingLog:{
        relation: Model.HasOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: require('./scoutingLogModel'),
        join: {
          from: 'activityLog.activity_id',
          to: 'scoutingLog.activity_id',
        },
      },
      soilDataLog:{
        relation: Model.HasOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: require('./soilDataLogModel'),
        join: {
          from: 'activityLog.activity_id',
          to: 'soilDataLog.activity_id',
        },
      },
      fieldWorkLog:{
        relation: Model.HasOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: require('./fieldWorkLogModel'),
        join: {
          from: 'activityLog.activity_id',
          to: 'fieldWorkLog.activity_id',
        },
      },
      harvestLog:{
        relation: Model.HasOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: require('./harvestLogModel'),
        join: {
          from: 'activityLog.activity_id',
          to: 'harvestLog.activity_id',
        },
      },
      harvestUse:{
        relation: Model.HasManyRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: require('./harvestUseModel'),
        join: {
          from: 'activityLog.activity_id',
          to: 'harvestUse.activity_id',
        },
      },
      seedLog:{
        relation: Model.HasOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: require('./seedLogModel'),
        join: {
          from: 'activityLog.activity_id',
          to: 'seedLog.activity_id',
        },
      },
      fieldCrop:{
        modelClass:require('./fieldCropModel'),
        relation:Model.ManyToManyRelation,
        join:{
          from: 'activityLog.activity_id',
          through: {
            modelClass: require('./activityCropsModel'),
            from: 'activityCrops.activity_id',
            to: 'activityCrops.field_crop_id',
          },
          to: 'fieldCrop.field_crop_id',
        },

      },
      field:{
        modelClass:require('./fieldModel'),
        relation:Model.ManyToManyRelation,
        join:{
          from: 'activityLog.activity_id',
          through: {
            modelClass: require('./activityFieldsModel'),
            from: 'activityFields.activity_id',
            to: 'activityFields.field_id',
          },
          to: 'field.field_id',
        },

      },
      ...this.baseRelationMappings('activityLog'),
    };
  }
}

module.exports = activityLogModel;
