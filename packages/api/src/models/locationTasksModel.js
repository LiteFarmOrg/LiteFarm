/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (activityFieldsModel.js) is part of LiteFarm.
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

class LocationTaskModel extends Model {
  static get tableName() {
    return 'location_tasks';
  }

  static get idColumn() {
    return 'task_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['location_id'],

      properties: {
        task_id: { type: 'integer' },
        location_id: { type: 'string' },
        additionalProperties: false,
      },
    };
  }
}

module.exports = LocationTaskModel;
