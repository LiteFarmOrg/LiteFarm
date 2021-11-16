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

const Model = require('objection').Model;
const baseModel = require('./baseModel');
const moment = require('moment');

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
        notes: { type: ['string', null] },
        abandon_date: { anyOf: [{ type: 'null' }, { type: 'date' }] },
        start_date: { anyOf: [{ type: 'null' }, { type: 'date' }] },
        complete_date: { anyOf: [{ type: 'null' }, { type: 'date' }] },
        complete_notes: { type: ['string', null] },
        rating: { type: ['integer', null], enum: [0, 1, 2, 3, 4, 5, null] },
        abandon_reason: { type: ['string', null] },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      crop_variety: {
        relation: Model.BelongsToOneRelation,
        modelClass: require('./cropVarietyModel'),
        join: {
          from: 'management_plan.crop_variety_id',
          to: 'crop_variety.crop_variety_id',
        },
      },
      crop_management_plan: {
        modelClass: require('./cropManagementPlanModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'management_plan.management_plan_id',
          to: 'crop_management_plan.management_plan_id',
        },
      },
    };
  }
}

module.exports = ManagementPlan;
