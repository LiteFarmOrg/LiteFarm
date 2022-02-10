/*
 *  Copyright 2019-2022 LiteFarm.org
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

const Model = require('objection').Model;
const baseModel = require('./baseModel');

class Notification extends baseModel {
  static get tableName() {
    return 'notification';
  }

  static get idColumn() {
    return 'notification_id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['title', 'body'],
      properties: {
        notification_id: { type: 'string' },
        title: { type: 'string', minLength: 1, maxLength: 255 },
        body: { type: 'string', minLength: 1, maxLength: 10000 },
        ref_type: {
          type: 'string',
          enum: ['task', 'location', 'users', 'farm', 'document', 'export'],
        },
        ref: { type: 'string' },
        farm_id: { type: 'string' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      //TODO: remove price and yield
      price: {
        relation: Model.HasManyRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: require('./priceModel'),
        join: {
          from: 'farm.farm_id',
          to: 'price.farm_id',
        },
      },
      yield: {
        relation: Model.HasManyRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: require('./yieldModel'),
        join: {
          from: 'farm.farm_id',
          to: 'yield.farm_id',
        },
      },
    };
  }

}

module.exports = Notification;
