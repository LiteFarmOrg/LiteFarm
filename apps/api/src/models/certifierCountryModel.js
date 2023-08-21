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
import certifierModel from './certifierModel.js';
import countryModel from './countryModel.js';

class Certification extends Model {
  static get tableName() {
    return 'certifier_country';
  }

  static get idColumn() {
    return 'certifier_country_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['location_id'],
      properties: {
        certifier_country_id: { type: 'integer' },
        certifier_id: { type: 'integer' },
        country_id: { type: 'integer' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      certifiers: {
        modelClass: certifierModel,
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'certifierCountryModel.certifier_country_id',
          to: 'certifierModel.certifier_id',
        },
      },
      countries: {
        modelClass: countryModel,
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'certifierCountryModel.certifier_country_id',
          to: 'countryModel.id',
        },
      },
    };
  }
}

export default Certification;
