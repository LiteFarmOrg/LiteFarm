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

const Model = require('objection').Model;
const lodash = require('lodash');

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
      required: ['pesticide_id', 'quantity_kg', 'target_disease_id', 'type'],

      properties: {
        task_id: { type: 'integer' },
        pesticide_id: { type: 'integer' },
        quantity_kg: { type: 'number' },
        type: {
          type: 'string',
          enum: ['systemicSpray', 'foliarSpray', 'handPick', 'biologicalControl', 'burning', 'soilFumigation', 'heatTreatment'],
        },
        target_disease_id: { type: 'integer' },
      },
      additionalProperties: false,
    };
  }
}

module.exports = PestControlTask;
