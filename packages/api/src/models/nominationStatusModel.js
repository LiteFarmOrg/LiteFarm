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
import nominationModel from './nominationModel.js';
import nominationWorkflowModel from './nominationWorkflowModel.js';

// Describes the nomination table
// Base model extends objection.js
class NominationStatus extends baseModel {
  static get tableName() {
    return 'nomination_status';
  }

  static get idColumn() {
    return 'status_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['nomination_id', 'workflow_id'],
      properties: {
        status_id: { type: 'integer' },
        nomination_id: { type: 'string' },
        workflow_id: { type: 'string' },
        notes: { type: 'text' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  //How to choose a relation type: https://vincit.github.io/objection.js/guide/relations.html#examples
  static get relationMappings() {
    return {
      nomination: {
        relation: Model.BelongsToOneRelation,
        modelClass: nominationModel,
        join: {
          from: 'nomination_status.nomination_id',
          to: 'nomination.nomination_id',
        },
      },
      nomination_workflow: {
        relation: Model.BelongsToOneRelation,
        modelClass: nominationWorkflowModel,
        join: {
          from: 'nomination_status.workflow_id',
          to: 'nomination_workflow.id',
        },
      },
    };
  }

  /**
   * Inserts a new status into the nomination status table.
   * @param {number} user_id Foreign key to the user table.
   * @param {number} nomination_id Foreign key to nomination table.
   * @param {number} workflow_id Foreign key to nomination workflow.
   * @static
   * @async
   * @return {Promise<*>}
   */
  static async createNominationStatus(user_id, nomination_id, workflow_id) {
    return await NominationStatus.query()
      .context({ user_id })
      .returning(['status_id'])
      .insert({ nomination_id, workflow_id });
  }

  /**
   * Returns a list of status about the nomination.
   * @param {number} nomination_id Foreign key to the nomination table.
   * @static
   * @async
   * @return {Promise<*>}
   */
  static async getAllStatusByNominationId(nomination_id) {
    return await NominationStatus.query()
      .select()
      .where('nomination_id', nomination_id)
      .orderBy('created_date', 'desc');
  }

  /**
   * Returns the most recent status about the nomination.
   * @param {number} nomination_id Foreign key to the nomination table.
   * @static
   * @async
   * @return {Promise<*>}
   */
  static async getRecentStatusByNominationId(nomination_id) {
    return await NominationStatus.query()
      .select()
      .where('nomination_id', nomination_id)
      .orderBy('created_date', 'desc')
      .first();
  }

  /**
   * Returns a list of status about the nomination.
   * @param {number} workflow_id Foreign key to the nomination workflow table .
   * @static
   * @async
   * @return {Promise<*>}
   */
  static async getStatusWorkflowName(workflow_id) {
    return await NominationStatus.query()
      .withGraphFetched('nomination_workflow')
      .select('nomination_workflow.name')
      .where('nomination_workflow.id', workflow_id);
  }
}

export default NominationStatus;
