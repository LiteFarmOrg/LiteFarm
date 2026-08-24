/*
 *  Copyright 2026 LiteFarm.org
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

import BaseModel from './baseModel.js';

class SurveyDraftModel extends BaseModel {
  static get tableName() {
    return 'survey_draft';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['farm_id', 'survey_key', 'survey_version', 'survey_data'],
      properties: {
        id: { type: 'string' },
        submission_id: { type: 'string' },
        farm_id: { type: 'string' },
        survey_key: { type: 'string' },
        survey_step: { type: 'string' },
        survey_version: { type: 'string' },
        survey_data: { type: 'object' },
        current_page_no: { type: 'integer' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }
}

export default SurveyDraftModel;
