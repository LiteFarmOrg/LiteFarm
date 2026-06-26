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

import Model from './baseFormatModel.js';
import SurveyCountryModel from './surveyCountryModel.js';

class SurveyModel extends Model {
  static get tableName() {
    return 'survey';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['key', 'cdn_directory'],
      properties: {
        id: { type: 'integer' },
        key: { type: 'string' },
        cdn_directory: { type: 'string' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      surveyCountries: {
        modelClass: SurveyCountryModel,
        relation: Model.HasManyRelation,
        join: {
          from: 'survey.id',
          to: 'survey_country.survey_id',
        },
      },
    };
  }

  /**
   * Returns the surveys available to the given country: those with a row for that country, plus
   * globally-available surveys (country_id IS NULL). Each returned row carries the CDN directory and
   * the version to load. A survey visible both globally and for the country yields two rows; the
   * caller resolves the country-specific row over the global one.
   */
  static async getAvailableSurveysByCountryId(countryId) {
    return SurveyModel.query()
      .joinRelated('surveyCountries')
      .where('surveyCountries.country_id', countryId)
      .orWhereNull('surveyCountries.country_id')
      .select(
        'survey.key as key',
        'survey.cdn_directory as cdn_directory',
        'surveyCountries.country_id as country_id',
        'surveyCountries.version as version',
      );
  }
}

export default SurveyModel;
