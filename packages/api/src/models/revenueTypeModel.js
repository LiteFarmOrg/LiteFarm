/*
 *  Copyright 2023 LiteFarm.org
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

import baseModel from './baseModel.js';

class RevenueType extends baseModel {
  static get tableName() {
    return 'revenue_type';
  }

  static get idColumn() {
    return 'revenue_type_id';
  }

  // Overriding the baseModel hidden to return the 'deleted' field
  static get hidden() {
    return ['created_at', 'created_by_user_id', 'updated_by_user_id', 'updated_at'];
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['revenue_name', 'farm_id', 'agriculture_associated'],

      properties: {
        revenue_type_id: { type: 'integer' },
        revenue_name: { type: 'string', minLength: 1, maxLength: 100 },
        farm_id: { type: 'string' },
        revenue_translation_key: { type: 'string' },
        agriculture_associated: { type: 'boolean' },
        crop_generated: { type: 'boolean' },
        ...this.baseProperties,
        additionalProperties: false,
      },
      if: {
        type: 'object',
        properties: {
          agriculture_associated: { const: true },
        },
        required: ['agriculture_associated'],
      },
      then: {
        type: 'object',
        required: ['crop_generated'],
      },
    };
  }
}

export default RevenueType;
