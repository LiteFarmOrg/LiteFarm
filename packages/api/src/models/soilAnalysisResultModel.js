/*
 *  Copyright 2025 LiteFarm.org
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

class SoilAnalysisResult extends Model {
  static get tableName() {
    return 'soil_analysis_result';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        sample_id: { type: 'integer' },
        analyte_id: { type: 'integer' },
        method: { type: 'string', nullable: true },
        method_reference: { type: 'string', nullable: true },
        detectable_limit: { type: 'number', nullable: true },
        value: { type: 'number' },
        unit: { type: 'string' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {};
  }
}

export default SoilAnalysisResult;
