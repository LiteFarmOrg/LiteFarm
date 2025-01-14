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

class AnimalBatchUseRelationshipModel extends Model {
  static get tableName() {
    return 'animal_batch_use_relationship';
  }

  static get idColumn() {
    return ['animal_batch_id', 'use_id'];
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['animal_batch_id', 'use_id'],
      properties: {
        animal_batch_id: { type: 'integer' },
        use_id: { type: 'integer' },
        other_use: { type: ['string', 'null'] },
      },
      additionalProperties: false,
    };
  }
}

export default AnimalBatchUseRelationshipModel;
