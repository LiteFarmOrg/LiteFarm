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

class userTodo extends Model {
  static get tableName() {
    return 'userTodo';
  }


  static get idColumn() {
    return ['todo_id', 'user_id'];
  }
  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id'],

      properties: {
        todo_id: { type: 'string' },
        user_id: { type: 'string' },
      },
    };
  }
  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      user:{
        modelClass:require('./userModel.js'),
        relation:Model.HasOneRelation,
        join:{
          from:'userTodo.user_id',
          to:'users.uid',
        },
      },
      todo:{
        modelClass:require('./todoModel.js'),
        relation:Model.HasOneRelation,
        join:{
          from:'userTodo.todo_id',
          to:'todo.todo_id',
        },
      },
    };
  }
}

module.exports = userTodo;
