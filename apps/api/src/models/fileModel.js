/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (managementPlanModel.js) is part of LiteFarm.
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

class FileModel extends Model {
  static get tableName() {
    return 'file';
  }

  static get idColumn() {
    return 'file_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['file_name', 'document_id'],
      properties: {
        file_id: { type: 'string' },
        document_id: { type: 'string' },
        file_name: { type: 'string' },
        url: { type: 'string' },
        thumbnail_url: { type: ['string', 'null'] },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {};
  }
}

export default FileModel;
