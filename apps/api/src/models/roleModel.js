/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (roleModel.js) is part of LiteFarm.
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

import Model from './baseFormatModel.js';
// TODO: Deprecate objection soft delete
import softDelete from 'objection-soft-delete';
// Patch for mergeContext deprecation from objection
import { QueryBuilder } from 'objection';
QueryBuilder.prototype.mergeContext = QueryBuilder.prototype.context;

class Role extends softDelete({ columnName: 'deleted' })(Model) {
  static get hidden() {
    return ['deleted'];
  }

  async $afterFind(queryContext) {
    await super.$afterFind(queryContext);
    const { hidden } = this.constructor;
    if (hidden.length > 0) {
      const { showHidden } = queryContext;
      if (!showHidden) {
        for (const property of hidden) {
          delete this[property];
        }
      }
    }
  }

  static get tableName() {
    return 'role';
  }

  static get idColumn() {
    return 'role_id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['role'],
      properties: {
        role_id: { type: 'integer' },
        role: {
          type: 'string',
          enum: ['Owner', 'Manager', 'Worker', 'Extension Officer'],
        },
        deleted: { type: 'boolean' },
      },
      additionalProperties: false,
    };
  }
}

export default Role;
