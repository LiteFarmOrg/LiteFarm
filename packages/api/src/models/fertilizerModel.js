/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (fertilizerModel.js) is part of LiteFarm.
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

class Fertilizer extends Model {
  static get tableName() {
    return 'fertilizer';
  }

  static get idColumn() {
    return 'fertilizer_id';
  }
  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['fertilizer_type', 'farm_id'],
      properties: {
        fertilizer_id: { type: 'string' },
        fertilizer_type: { type: 'string' },
        moisture_percentage: { type: 'number' },
        n_percentage: { type: 'number' },
        nh4_n_ppm: { type: 'number' },
        p_percentage: { type: 'number' },
        k_percentage: { type: 'number' },
        farm_id: {
          anyOf: [
            {
              type: 'string',
            },
            {
              type: 'null',
            },
          ],
        },
      },
    };
  }
}

module.exports = Fertilizer;
