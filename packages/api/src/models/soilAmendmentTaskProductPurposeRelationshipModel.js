/*
 *  Copyright 2024 LiteFarm.org
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

import Model from './baseFormatModel.js';
import soilAmendmentPurposeModel from './soilAmendmentPurposeModel.js';

class soilAmendmentTaskProductPurposeRelationshipModel extends Model {
  static get tableName() {
    return 'soil_amendment_task_product_purpose_relationship';
  }

  static get idColumn() {
    return ['task_products_id', 'purpose_id'];
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['task_products_id', 'purpose_id'],
      properties: {
        task_products_id: { type: 'integer' },
        purpose_id: { type: 'integer' },
        other_purpose: { type: ['string', 'null'] },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      purpose: {
        relation: Model.BelongsToOneRelation,
        modelClass: soilAmendmentPurposeModel,
        join: {
          from: 'soil_amendment_task_product_purpose_relationship.purpose_id',
          to: 'soil_amendment_purpose.id',
        },
      },
    };
  }

  // Custom function used in copy crop plan
  // Should contain all jsonSchema() and relationMappings() keys
  static get templateMappingSchema() {
    return {
      // jsonSchema()
      task_products_id: 'omit',
      purpose_id: 'keep',
      other_purpose: 'keep',
      // relationMappings()
      purpose: 'omit',
    };
  }
}

export default soilAmendmentTaskProductPurposeRelationshipModel;
