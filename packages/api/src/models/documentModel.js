/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (managementPlanModel.js) is part of LiteFarm.
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

class Document extends baseModel {
  static get tableName() {
    return 'document';
  }

  static get idColumn() {
    return 'document_id';
  }


  static get jsonSchema() {
    return {
      type: 'object',
      required: [ 'name', 'thumbnail_url', 'farm_id' ],
      properties: {
        farm_id: { type: 'string' },
        name: { type: 'string' },
        thumbnail_url: { type: 'string' },
        valid_until: { type: [ 'date', null ] },
        notes: { type: [ 'string', null ] },
        type: {
          type: [ 'string', null ],
          enum: ['CLEANING_PRODUCT', 'CROP_COMPLIANCE', 'FERTILIZING_PRODUCT', 'PEST_CONTROL_PRODUCT', 'SOIL_AMENDMENT', 'OTHER'],
        },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      farm: {
        relation: Model.BelongsToOneRelation,
        modelClass: require('./farmModel'),
        join: {
          from: 'document.farm_id',
          to: 'farm.farm_id',
        },
      },
      file: {
        relation: Model.HasManyRelation,
        modelClass: require('./fileModel'),
        join: {
          from: 'document.document_id',
          to: 'file.document_id',
        },
      },
    };
  }
}

module.exports = Document;
