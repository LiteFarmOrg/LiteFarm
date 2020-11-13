/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (userFarmbaseModel.js) is part of LiteFarm.
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

const baseModel = require('./baseModel');
const Model = require('objection').Model;

class organicCertifierSurveyModel extends baseModel(Model) {
  static get tableName() {
    return 'organicCertifierSurvey';
  }

  static get idColumn() {
    return 'survey_id'
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['farm_id'],
      properties: {
        survey_id: { type: 'string' },
        farm_id: { type: 'string' },
        interested: { type: 'boolean' },
        certifiers: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        ...super.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      createdByUser: {
        modelClass: require('./userModel'),
        relation: baseModel.HasOneRelation,
        join: {
          from: 'organicCertifierSurvey.created_by_user_id',
          to: 'users.user_id',
        },
      },
      updatedByUser: {
        modelClass: require('./userModel'),
        relation: baseModel.HasOneRelation,
        join: {
          from: 'organicCertifierSurvey.updated_by_user_id',
          to: 'users.user_id',
        },
      },
      userFarm:{
        modelClass: require('./userFarmModel'),
        relation: baseModel.HasOneRelation,
        join: {
          from: ['organicCertifierSurvey.updated_by_user_id', 'organicCertifierSurvey.farm_id'],
          to: ['userFarm.user_id', 'userFarm.farm_id'],
        },
      },
      farm: {
        modelClass: require('./farmModel'),
        relation: baseModel.HasOneRelation,
        join: {
          from: 'organicCertifierSurvey.farm_id',
          to: 'farm.farm_id',
        },
      },
    }
  }
}

module.exports = organicCertifierSurveyModel;
