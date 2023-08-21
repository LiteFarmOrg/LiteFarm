/*
 *  Copyright (C) 2023 LiteFarm.org
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

import { Model } from 'objection';
import baseModel from './baseModel.js';
import ManagementPlan from './managementPlanModel.js';

class ManagementPlanGroup extends baseModel {
  static get tableName() {
    return 'management_plan_group';
  }

  static get idColumn() {
    return 'management_plan_group_id';
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
      required: ['repetition_count', 'repetition_config'],
      properties: {
        management_plan_group_id: { type: 'string' },
        repetition_count: { type: 'integer' },
        repetition_config: { type: 'object' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      management_plans: {
        modelClass: ManagementPlan,
        relation: Model.HasManyRelation,
        join: {
          from: 'management_plan_group.management_plan_group_id',
          to: 'management_plan.management_plan_group_id',
        },
      },
    };
  }
  static get hidden() {
    return baseModel.hidden.concat(['repetition_config']);
  }
}

export default ManagementPlanGroup;
