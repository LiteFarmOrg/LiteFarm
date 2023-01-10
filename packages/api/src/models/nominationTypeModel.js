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
class NominationType extends baseModel {
  static get tableName() {
    return 'nomination_type';
  }

  static get idColumn() {
    return 'nomination_type';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['nomination_type', 'workflow_group'],
      properties: {
        nomination_type: { type: 'string' },
        workflow_group: { type: 'string' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  //How to choose a relation type: https://vincit.github.io/objection.js/guide/relations.html#examples
  static get relationMappings() {
    return {
      nominations: {
        relation: Model.HasManyRelation,
        modelClass: nominationModel,
        join: {
          from: 'nomination_type.nomination_type',
          to: 'nomination.nomination_type',
        },
      },
      workflows: {
        relation: Model.HasManyRelation,
        modelClass: nominationWorkflowModel,
        join: {
          from: 'nomination_type.workflow_group',
          to: 'nomination_workflow.workflow_group',
        },
      },
    };
  }
}

export default NominationType;
