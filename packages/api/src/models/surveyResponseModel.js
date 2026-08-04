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

import BaseFormatModel from './baseFormatModel.js';

class SurveyResponseModel extends BaseFormatModel {
  static get tableName() {
    return 'survey_response';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['farm_id', 'survey_key', 'survey_version', 'project_id', 'survey_response'],
      properties: {
        id: { type: 'integer' },
        submission_id: { type: 'string' },
        farm_id: { type: 'string' },
        survey_key: { type: 'string' },
        survey_version: { type: 'string' },
        project_id: { type: 'string' },
        survey_step: { type: ['string', 'null'] },
        survey_response: { type: 'object' },
        created_by_user_id: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
      },
      additionalProperties: false,
    };
  }

  async $beforeInsert(context) {
    await super.$beforeInsert(context);
    const user_id = context?.user_id;
    if (!user_id) {
      throw new Error('user_id must be passed into context on insert');
    }
    this.created_by_user_id = user_id;
    this.created_at = new Date().toISOString();
  }
}

export default SurveyResponseModel;
