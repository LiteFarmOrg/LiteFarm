/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (waterBalanceModel.js) is part of LiteFarm.
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

class WaterBalance extends Model {
  static get tableName() {
    return 'waterBalance';
  }

  static get idColumn() {
    return 'water_balance_id';
  }
  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['crop_id', 'field_id', 'soil_water', 'plant_available_water'],
      properties: {
        water_balance_id: { type: 'integer' },
        crop_id: { type: 'integer' },
        field_id: { type: 'string' },
        created_at: { type: 'date-time' },
        soil_water: { type: 'float' },
        plant_available_water: { type: 'float' },
      },
      additionalProperties: false,
    };
  }
}

module.exports = WaterBalance;
