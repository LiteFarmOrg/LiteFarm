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
import certificationSystemTypeModel from './certificationSystemTypeModel.js';

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
      properties: {
        certifier_id: { type: 'integer' },
        system_type_id: { type: 'integer' },
        certifier_name: { type: 'string' },
        certifier_acronym: { type: 'string' },
        supported: { type: 'boolean' },
        survey_id: { type: 'string' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      certificationSystemType: {
        modelClass: certificationSystemTypeModel,
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'certifiers.system_type_id',
          to: 'certification_system_type.id',
        },
      },
    };
  }

  // TODO LF-5379: temporary shim — maps new DB column name back to old API field name for frontend compatibility
  $formatJson(json) {
    json = super.$formatJson(json);
    json.certification_id = json.system_type_id;
    delete json.system_type_id;
    return json;
  }

  // TODO LF-5379: temporary shim — maps old API field name back to new DB column name
  $parseJson(json) {
    json = super.$parseJson(json);
    if (json.certification_id !== undefined) {
      json.system_type_id = json.certification_id;
      delete json.certification_id;
    }
    return json;
  }
}

export default Certifier;
