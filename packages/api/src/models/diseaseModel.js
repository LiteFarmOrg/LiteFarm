/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (diseaseModel.js) is part of LiteFarm.
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

class Disease extends softDelete({ columnName: 'deleted' })(Model) {
  static get tableName() {
    return 'disease';
  }

  static get idColumn() {
    return 'disease_id';
  }
  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['disease_common_name', 'farm_id', 'disease_group'],
      properties: {
        disease_scientific_name: { type: 'string' },
        disease_common_name: { type: 'string' },
        disease_group: { type: 'string',
          enum: ['Fungus', 'Insect', 'Bacteria', 'Virus', 'Deficiency', 'Mite', 'Other', 'Weed'],
        },
        farm_id: { type: 'string' },
        deleted: { type: 'boolean' },
      },
      additionalProperties: false,
    };
  }
}

module.exports = Disease;
