/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (farmModel.js) is part of LiteFarm.
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
import nominationStatusModel from './nominationStatusModel.js';
import nominationTypeModel from './nominationTypeModel.js';

// Describes the nomination table
// Base model extends objection.js
class NominationWorkflow extends baseModel {
  static get tableName() {
    return 'nomination_workflow';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['status', 'type_group'],
      properties: {
        workflow_id: { type: 'integer' },
        status: { type: 'string' },
        type_group: { type: 'string' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  //How to choose a relation type: https://vincit.github.io/objection.js/guide/relations.html#examples
  static get relationMappings() {
    return {
      workflow_group: {
        relation: Model.BelongsToOneRelation,
        modelClass: nominationTypeModel,
        join: {
          from: 'nomination_workflow.type_group',
          to: 'nomination_type.nomination_type',
        },
      },
      all_this_status: {
        relation: Model.HasManyRelation,
        modelClass: nominationStatusModel,
        join: {
          from: 'nomination_workflow.workflow_id',
          to: 'nomination_status.status',
        },
      },
    };
  }

  /**
   * Gets the id of a desired workflow step.
   * @param {string} status The workflow step name.
   * @param {string} type_group The group name the workflow status belongs to.
   * @static
   * @async
   * @return {Promise<*>}
   */
  static async getWorkflowIdByStatusAndTypeGroup(status, type_group, trx) {
    return await NominationWorkflow.query(trx)
      .select('workflow_id')
      .where('status', status)
      .andWhere('type_group', type_group)
      .first();
  }
}

export default NominationWorkflow;
