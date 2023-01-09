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
      required: ['name', 'group'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        group: { type: 'string' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  //How to choose a relation type: https://vincit.github.io/objection.js/guide/relations.html#examples
  static get relationMappings() {
    return {
      nomination_type: {
        relation: Model.BelongsToOneRelation,
        modelClass: nominationTypeModel,
        join: {
          from: 'nomination_workflow.group',
          to: 'nomination_type.workflow_group',
        },
      },
      nomination_status: {
        relation: Model.HasManyRelation,
        modelClass: nominationStatusModel,
        join: {
          from: 'nomination_workflow.id',
          to: 'nomination_status.status',
        },
      },
    };
  }

  /**
   * Inserts new nomination workflows into the nomination workflow table.
   * @param {number} user_id Foreign key to the user table.
   * @param {Object[]} workflows An array of workflows to add to the the table.
   * @static
   * @async
   * @return {Promise<*>}
   */
  static async createNominationWorkflows(user_id, workflows) {
    return await nominationTypeModel
      .query()
      .context({ user_id })
      .returning(['id', 'name', 'group'])
      .insert([...workflows]);
  }

  /**
   * Gets the id of a desired workflow step.
   * @param {string} name The workflow step name.
   * @param {string} group The group the workflow step belongs to.
   * @static
   * @async
   * @return {Promise<*>}
   */
  static async getWorkflowIdByNameAndGroup(name, group) {
    return await nominationTypeModel
      .query()
      .select('id')
      .where('name', name)
      .andWhere('group', group);
  }
}

export default NominationWorkflow;
