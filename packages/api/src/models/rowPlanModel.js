/*
 *  Copyright 2026 LiteFarm.org
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

import BaseModel from './baseModel.js';
import FieldRowModel from './fieldRowModel.js';

class RowPlanModel extends BaseModel {
  static get tableName() {
    return 'row_plan';
  }

  static get idColumn() {
    return 'row_plan_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['farm_id', 'location_id', 'source'],
      properties: {
        row_plan_id: { type: 'string' },
        farm_id: { type: 'string' },
        location_id: { type: 'string' },
        source: { type: 'string', enum: ['in_app', 'robot'] },
        map_id: { type: ['string', 'null'], maxLength: 100 },
        map_hash: { type: ['string', 'null'], maxLength: 64 },
        inputs_hash: { type: ['string', 'null'], maxLength: 64 },
        schema_version: { type: 'integer' },
        generator: { type: ['string', 'null'] },
        origin: { type: ['object', 'null'] },
        params: { type: ['object', 'null'] },
        supersedes_row_plan_id: { type: ['string', 'null'] },
        supersedes_map_id: { type: ['string', 'null'], maxLength: 100 },
        superseded_at: { type: ['string', 'null'] },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      rows: {
        relation: BaseModel.HasManyRelation,
        modelClass: FieldRowModel,
        join: { from: 'row_plan.row_plan_id', to: 'field_row.row_plan_id' },
      },
    };
  }
}

export default RowPlanModel;
