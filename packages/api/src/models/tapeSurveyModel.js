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

class TapeSurveyModel extends BaseModel {
  static get tableName() {
    return 'tape_survey';
  }

  static get idColumn() {
    return 'tape_survey_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['farm_id', 'user_id', 'survey_data'],
      properties: {
        tape_survey_id: { type: 'integer' },
        farm_id: { type: 'string' },
        user_id: { type: 'string' },
        survey_data: { type: 'object' },
        ...super.baseProperties,
      },
      additionalProperties: false,
    };
  }
}

export default TapeSurveyModel;
