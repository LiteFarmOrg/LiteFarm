/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (pestControlLogModel.js) is part of LiteFarm.
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

import Model from './baseFormatModel.js';

import lodash from 'lodash';

class PestControlTask extends Model {
  static get tableName() {
    return 'pest_control_task';
  }

  static get idColumn() {
    return 'task_id';
  }

  $parseJson(json, opt) {
    // Remember to call the super class's implementation.
    json = super.$parseJson(json, opt);
    // Do your conversion here.
    return lodash.pick(json, Object.keys(this.constructor.jsonSchema.properties));
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['control_method'],

      properties: {
        task_id: { type: 'integer' },
        product_id: { type: ['integer', 'null'] },
        product_quantity: { type: ['number', 'null'] },
        product_quantity_unit: {
          type: 'string',
          enum: ['g', 'lb', 'kg', 't', 'mt', 'oz', 'l', 'gal', 'ml', 'fl-oz'],
        },
        other_method: { type: ['string', 'null'] },
        pest_target: { type: 'string' },
        control_method: {
          type: 'string',
          enum: [
            'systemicSpray',
            'foliarSpray',
            'handWeeding',
            'biologicalControl',
            'flameWeeding',
            'soilFumigation',
            'heatTreatment',
            'other',
          ],
        },
      },
      additionalProperties: false,
    };
  }

  // Custom function used in copy crop plan
  // Should contain all jsonSchema() and relationMappings() keys
  static get templateMappingSchema() {
    return {
      // jsonSchema()
      task_id: 'omit',
      product_id: 'keep',
      product_quantity: 'keep',
      product_quantity_unit: 'keep',
      other_method: 'keep',
      pest_target: 'keep',
      control_method: 'keep',
      // relationMappings
    };
  }
}

export default PestControlTask;
