/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (userTodo.js) is part of LiteFarm.
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

class Password extends Model {
  static get tableName() {
    return 'password';
  }

  static get idColumn() {
    return 'user_id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',

      properties: {
        user_id: { type: 'string' },
        password_hash: { type: 'string' },
        reset_token_version: { type: 'integer' },
        created_at: { type: 'date-time' },
      },
    };
  }
  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      user: {
        modelClass: require('./userModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'password.user_id',
          to: 'users.user_id',
        },
      },
    };
  }

  async $beforeInsert(context) {
    await super.$beforeInsert(context);
    this.created_at = new Date().toISOString();
  }
}

module.exports = Password;
