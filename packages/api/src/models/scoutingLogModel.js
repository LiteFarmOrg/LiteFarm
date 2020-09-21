/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (scoutingLogModel.js) is part of LiteFarm.
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
const softDelete = require('objection-soft-delete');

class ScoutingLog extends softDelete({ columnName: 'deleted' })(Model)   {
  static get tableName() {
    return 'scoutingLog';
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

      properties: {
        activity_id: { type: 'integer' },
        deleted: { type: 'boolean' },
        type: {
          type: 'string',
          enum:['harvest', 'pest', 'disease', 'weed', 'other'],
        },
      },
    };
  }
}

module.exports = ScoutingLog;
