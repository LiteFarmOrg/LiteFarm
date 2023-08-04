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

import baseModel from './baseModel.js';
import moment from 'moment';
import cropVarietyModel from './cropVarietyModel.js';
import cropManagementPlanModel from './cropManagementPlanModel.js';
import managementPlanGroup from './managementPlanGroupModel.js';

class ManagementPlan extends baseModel {
  static get tableName() {
    return 'management_plan';
  }

  static get idColumn() {
    return 'management_plan_id';
  }

  getDate(seed_date, duration) {
    if (duration !== null && duration !== undefined && seed_date) {
      return moment(seed_date).add(duration, 'days').utc().format('YYYY-MM-DD');
    }
    return undefined;
  }

  async $beforeInsert(context) {
    await super.$beforeInsert(context);
  }

  async $beforeUpdate(opt, context) {
    await super.$beforeUpdate(opt, context);
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['crop_variety_id', 'name'],
      properties: {
        management_plan_id: { type: 'integer' },
        crop_variety_id: { type: 'string' },
        name: { type: 'string' },
        notes: { type: ['string', 'null'] },
        abandon_date: { type: ['string', 'null'], format: 'date' },
        start_date: { type: ['string', 'null'], format: 'date' },
        complete_date: { type: ['string', 'null'], format: 'date' },
        complete_notes: { type: ['string', 'null'] },
        rating: { type: ['integer', 'null'], enum: [0, 1, 2, 3, 4, 5, null] },
        abandon_reason: { type: ['string', 'null'] },
        management_plan_group_id: { type: ['string', 'null'] },
        repetition_number: { type: ['integer', 'null'] },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      crop_variety: {
        relation: baseModel.BelongsToOneRelation,
        modelClass: cropVarietyModel,
        join: {
          from: 'management_plan.crop_variety_id',
          to: 'crop_variety.crop_variety_id',
        },
      },
      crop_management_plan: {
        modelClass: cropManagementPlanModel,
        relation: baseModel.HasOneRelation,
        join: {
          from: 'management_plan.management_plan_id',
          to: 'crop_management_plan.management_plan_id',
        },
      },
      management_plan_group: {
        relation: baseModel.BelongsToOneRelation,
        modelClass: managementPlanGroup,
        join: {
          from: 'management_plan.management_plan_group_id',
          to: 'management_plan_group.management_plan_group_id',
        },
      },
    };
  }

  // Custom function used in copy crop plan
  // Should contain all jsonSchema() and relationMappings() keys
  static get templateMappingSchema() {
    return {
      // jsonSchema()
      management_plan_id: 'omit',
      crop_variety_id: 'keep',
      name: 'edit',
      notes: 'keep',
      abandon_date: 'omit',
      start_date: 'omit',
      complete_date: 'omit',
      complete_notes: 'omit',
      rating: 'omit',
      abandon_reason: 'omit',
      management_plan_group_id: 'omit',
      repetition_number: 'edit',
      // relationMappings
      crop_variety: 'omit',
      crop_management_plan: 'edit',
    };
  }
}

export default ManagementPlan;
