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
    this.transplant_date = this.getDate(this.seed_date, this.transplant_days);
    this.germination_date = this.getDate(this.seed_date, this.germination_days);
    this.termination_date = this.getDate(this.seed_date, this.termination_days);
    this.harvest_date = this.getDate(this.seed_date, this.harvest_days);
    // throw new Error('Need to properly set dates');
  }

  async $beforeUpdate(opt, context) {
    await super.$beforeUpdate(opt, context);
    // TODO: if seed_date/transplant_days/germination_days/termination_days/harvest_days exist reset dates
    if (Object.keys(this) > 3 || !this.deleted) {
      this.transplant_date = this.getDate(this.seed_date, this.transplant_days);
      this.germination_date = this.getDate(this.seed_date, this.germination_days);
      this.termination_date = this.getDate(this.seed_date, this.termination_days);
      this.harvest_date = this.getDate(this.seed_date, this.harvest_days);
      throw new Error('Need to properly set dates');
    }
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['crop_variety_id', 'seed_date', 'name'],
      properties: {
        management_plan_id: { type: 'integer' },
        crop_variety_id: { type: 'string' },
        name: { type: 'string' },
        seed_date: { type: 'date' },
        needs_transplant: { type: 'boolean' },
        for_cover: { type: 'boolean' },
        transplant_date: { type: 'date' },
        transplant_days: { type: ['integer', null] },
        germination_date: { type: 'date' },
        germination_days: { type: ['integer', null] },
        termination_date: { type: 'date' },
        termination_days: { type: ['integer', null] },
        harvest_date: { type: 'date' },
        harvest_days: { type: ['integer', null] },
        notes: { type: ['string', null] },
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
      transplant_container: {
        relation: Model.HasOneRelation,
        modelClass: require('./transplantContainerModel'),
        join: {
          from: 'management_plan.management_plan_id',
          to: 'transplant_container.management_plan_id',
        },
      },

      task: {
        relation: Model.ManyToManyRelation,
        modelClass: require('./taskModel.js'),
        join: {
          to: 'task.task_id',
          through: {
            from: 'management_tasks.task_id',
            to: 'management_tasks.management_plan_id',
          },
          from: 'management_plan.management_plan_id',
        },
      },
    };
  }
}

module.exports = ManagementPlan;
