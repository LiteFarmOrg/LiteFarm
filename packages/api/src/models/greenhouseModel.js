/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (fieldModel.js) is part of LiteFarm.
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
import organicHistoryModel from './organicHistoryModel.js';

class Greenhouse extends Model {
  // Code from gardenModel.js and fieldModel.js
  // Converts datetimes to date strings by stripping the time component
  $parseJson(json, opt) {
    json = super.$parseJson(json, opt);
    const pgDateTypeFields = ['transition_date'];
    if (Object.keys(json).some((e) => pgDateTypeFields.includes(e))) {
      Object.keys(json).forEach((key) => {
        if (pgDateTypeFields.includes(key) && json[key]) {
          json[key] = json[key].split('T')[0];
        }
      });
    }
    return json;
  }

  static get tableName() {
    return 'greenhouse';
  }

  static get idColumn() {
    return 'location_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['location_id'],
      properties: {
        location_id: { type: 'string' },
        organic_status: { type: 'string', enum: ['Non-Organic', 'Transitional', 'Organic'] },
        transition_date: {
          type: 'string',
          format: 'date',
        },
        supplemental_lighting: { type: ['boolean', 'null'] },
        co2_enrichment: { type: ['boolean', 'null'] },
        greenhouse_heated: { type: ['boolean', 'null'] },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      organic_history: {
        modelClass: organicHistoryModel,
        relation: Model.HasManyRelation,
        join: {
          from: 'greenhouse.location_id',
          to: 'organic_history.location_id',
        },
      },
    };
  }
}

export default Greenhouse;
