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

class Certifier extends Model {
  static get tableName() {
    return 'certifiers';
  }

  static get idColumn() {
    return 'certifier_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['location_id'],
      properties: {
        certifier_id: { type: 'integer' },
        certification_type: { type: 'integer' },
        certifier_name: { type: 'string' },
        certifier_acronym: { type: 'string' },
        supported: { type: 'boolean' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
        certifications: {
            modelClass: require('./certificationModel'),
            relation: Model.BelongsToOneRelation,
            join: {
                from: 'certifierModel.certification_type',
                to: 'certificationModel.certification_id',
              },
        }
    };
  }
}

module.exports = Certifier;
