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

const Model = require('objection').Model;

class Certification extends Model {
  static get tableName() {
    return 'certifications';
  }

  static get idColumn() {
    return 'certification_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['location_id'],
      properties: {
        certification_id: { type: 'integer' },
        certification_name: { type: 'string' },
        certification_translation_key: { type: 'string' }
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
        certifiers: {
            modelClass: require('./certifierModel'),
            relation: Model.HasManyRelation,
            join: {
                from: 'certificationModel.certification_id',
                to: 'certifierModel.certification_type',
              },
        }
    };
  }
}

module.exports = Certification;
