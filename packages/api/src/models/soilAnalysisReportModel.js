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

class SoilAnalysisReport extends Model {
  static get tableName() {
    return 'soil_analysis_report';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        document_id: { type: 'string', format: 'uuid' },
        status: { type: 'string' },
        error_message: { type: 'string', nullable: true },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      document: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'Document',
        join: {
          from: 'soil_analysis_report.document_id',
          to: 'document.document_id',
        },
      },
      samples: {
        relation: Model.HasManyRelation,
        modelClass: 'SoilAnalysisSample',
        join: {
          from: 'soil_analysis_report.id',
          to: 'soil_analysis_sample.report_id',
        },
      },
      analytes: {
        relation: Model.ManyToManyRelation,
        modelClass: 'SoilAnalyte',
        join: {
          from: 'soil_analysis_report.id',
          through: {
            from: 'soil_analysis_result.report_id',
            to: 'soil_analysis_result.analyte_id',
          },
          to: 'soil_analyte.id',
        },
      },
    };
  }
}

export default SoilAnalysisReport;
