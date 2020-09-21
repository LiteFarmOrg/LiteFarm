/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (todoModel.js) is part of LiteFarm.
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
const softDelete = require('objection-soft-delete');

class Todo extends softDelete({columnName: 'deleted'})(Model) {
  static get tableName() {
    return 'todo';
  }


  static get idColumn() {
    return 'todo_id';
  }
  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['todo_text', 'farm_id'],

      properties: {
        todo_id: { type: 'string', minLength: 1, maxLength: 255 },
        todo_text: { type: 'string' },
        farm_id: { type: 'string', minLength: 1, maxLength: 255 },
        deleted: { type: 'boolean' },
      },
    };
  }

  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      userTodo:{
        modelClass:require('./userTodo.js'),
        relation:Model.HasManyRelation,
        join:{
          from:'userTodo.todo_id',
          to:'todo.todo_id',
        },
      },
    }
  }
}

module.exports = Todo;
