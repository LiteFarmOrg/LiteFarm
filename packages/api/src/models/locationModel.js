/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (fieldModel.js) is part of LiteFarm.
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
const baseModel = require('./baseModel');

class Location extends baseModel {
  static get tableName() {
    return 'location';
  }

  static get idColumn() {
    return 'location_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['farm_id', 'name'],
      properties: {
        location_id: { type: 'string' },
        farm_id: { type: 'string' },
        name: { type: 'string' },
        notes: { type: 'string' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }
  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      fieldCrop:{
        modelClass: require('./fieldCropModel.js'),
        relation: Model.HasManyRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        join: {
          from: 'fieldCrop.location_id',
          to:'location.location_id',
        },
      },
      figure: {
        modelClass: require('./figureModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'figure.location_id',
        },
      },
      field: {
        modelClass: require('./fieldModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'field.location_id',
        },
      },
      barn: {
        modelClass: require('./barnModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'barn.location_id',
        },
      },
      buffer_zone: {
        modelClass: require('./bufferZoneModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'buffer_zone.location_id',
        },
      },
      ceremonial_area: {
        modelClass: require('./ceremonialAreaModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'ceremonial_area.location_id',
        },
      },
      creek: {
        modelClass: require('./creekModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'creek.location_id',
        },
      },
      fence: {
        modelClass: require('./fenceModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'fence.location_id',
        },
      },
      gate: {
        modelClass: require('./gateModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'gate.location_id',
        },
      },
      greenhouse: {
        modelClass: require('./greenhouseModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'greenhouse.location_id',
        },
      },
      ground_water: {
        modelClass: require('./groundWaterModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'ground_water.location_id',
        },
      },
      natural_area: {
        modelClass: require('./naturalAreaModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'natural_area.location_id',
        },
      },
      residence: {
        modelClass: require('./residenceModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'residence.location_id',
        },
      },
      water_valve: {
        modelClass: require('./waterValveModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'water_valve.location_id',
        },
      },








      ...this.baseRelationMappings('location'),
    };
  }
}

module.exports = Location;
