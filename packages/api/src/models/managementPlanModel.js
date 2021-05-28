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
const baseModel = require('./baseModel')

class ManagementPlan extends baseModel {
  static get tableName() {
    return 'management_plan';
  }

  static get idColumn() {
    return 'management_plan_id';
  }

  getDate(seed_date, duration) {
    // TODO set dates
    if (duration !== null && duration !== undefined && seed_date) {
      return seed_date;
    }
    return undefined;
  }

  async $beforeInsert(context) {
    await super.$beforeInsert(context);
    this.transplant_date = this.getDate(this.seed_date, this.transplant_days);
    this.germination_date = this.getDate(this.seed_date, this.germination_days);
    this.termination_date = this.getDate(this.seed_date, this.termination_days);
    this.harvest_date = this.getDate(this.seed_date, this.harvest_days);
    throw new Error('Need to properly set dates');
  }

  async $beforeUpdate(context) {
    await super.$beforeUpdate(context);
    // TODO: if seed_date/transplant_days/germination_days/termination_days/harvest_days exist reset dates
    this.transplant_date = this.getDate(this.seed_date, this.transplant_days);
    this.germination_date = this.getDate(this.seed_date, this.germination_days);
    this.termination_date = this.getDate(this.seed_date, this.termination_days);
    this.harvest_date = this.getDate(this.seed_date, this.harvest_days);
    throw new Error('Need to properly set dates');
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['location_id', 'crop_variety_id', 'seed_date'],
      properties: {
        management_plan_id: { type: 'integer' },
        location_id: { type: 'string' },
        crop_variety_id: { type: 'string' },
        seed_date: { type: 'date' },
        needs_transplant: { type: 'boolean' },
        for_cover: { type: 'boolean' },
        transplant_date: { type: 'date' },
        transplant_days: { type: 'integer' },
        germination_date: { type: 'date' },
        germination_days: { type: 'integer' },
        termination_date: { type: 'date' },
        termination_days: { type: 'integer' },
        harvest_date: { type: 'date' },
        harvest_days: { type: 'integer' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }
  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      location: {
        relation: Model.BelongsToOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: require('./locationModel.js'),
        join: {
          from: 'management_plan.location_id',
          to: 'location.location_id',
        },

      },
      crop_variety: {
        relation: Model.BelongsToOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: require('./cropVarietyModel'),
        join: {
          from: 'management_plan.crop_variety_id',
          to: 'crop_variety.crop_variety_id',
        },
      },
      activityLog:{
        relation:Model.ManyToManyRelation,
        modelClass:require('./activityLogModel.js'),
        join:{
          to: 'activityLog.activity_id',
          through:{
            from:'activityCrops.activity_id',
            to:'activityCrops.management_plan_id',
          },
          from:'management_plan.management_plan_id',
        },
      },
    };
  }
}

module.exports = ManagementPlan;
