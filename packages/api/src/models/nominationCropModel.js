/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
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

// Describes the nomination_crop table
class NominationCrop extends Model {
  static get tableName() {
    return 'nomination_crop';
  }

  static get idColumn() {
    return ['nomination_id', 'crop_id'];
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['nomination_id', 'crop_id'],
      properties: {
        nomination_id: { type: 'integer' },
        crop_id: { type: 'integer' },
      },
      additionalProperties: false,
    };
  }
}

export default NominationCrop;
