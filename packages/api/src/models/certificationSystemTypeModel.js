/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
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
import certifierModel from './certifierModel.js';

class CertificationSystemType extends Model {
  static get tableName() {
    return 'certification_system_type';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        translation_key: { type: 'string' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      certifiers: {
        modelClass: certifierModel,
        relation: Model.HasManyRelation,
        join: {
          from: 'certification_system_type.id',
          to: 'certifiers.system_type_id',
        },
      },
    };
  }

  // TODO LF-5379: temporary shim — maps new DB column names back to old API field names for frontend compatibility
  $formatJson(json) {
    json = super.$formatJson(json);
    json.certification_id = json.id;
    json.certification_type = json.name;
    json.certification_translation_key = json.translation_key;
    delete json.id;
    delete json.name;
    delete json.translation_key;
    return json;
  }

  // TODO LF-5379: temporary shim — maps old API field names back to new DB column names
  $parseJson(json) {
    json = super.$parseJson(json);
    if (json.certification_id !== undefined) {
      json.id = json.certification_id;
      delete json.certification_id;
    }
    if (json.certification_type !== undefined) {
      json.name = json.certification_type;
      delete json.certification_type;
    }
    if (json.certification_translation_key !== undefined) {
      json.translation_key = json.certification_translation_key;
      delete json.certification_translation_key;
    }
    return json;
  }
}

export default CertificationSystemType;
