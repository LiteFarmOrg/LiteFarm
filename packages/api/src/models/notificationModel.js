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
      required: ['translation_key'],
      properties: {
        notification_id: { type: 'string' },
        translation_key: { type: 'string' },
        variables: { type: 'array' },
        entity_id: { type: 'string' },
        entity_type: { type: 'string' },
        context: { type: 'object' },
        farm_id: { type: 'string' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }
}

module.exports = Notification;
