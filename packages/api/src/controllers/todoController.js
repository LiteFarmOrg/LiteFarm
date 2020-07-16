/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (todoController.js) is part of LiteFarm.
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

const baseController = require('../controllers/baseController');
const notificationModel = require('../models/notificationModel');
const TodoModel = require('../models/todoModel');
const userTodo = require('../models/userTodo');

const { transaction } = require('objection');
const { Model } = require('objection');
const ExceptionHandler = require('../LiteFarmUtility/exceptionHandler')

class todoController extends baseController {
  static addTodo() {
    return async (req, res) => {
      const transac = await transaction.start(Model.knex());
      try{
        if(req.body){
          await todoController.insertTodo(req.body, transac);
          await todoController.addNotificationForUsers(req.body.users, 'todo_added', transac);
          await transac.commit();
          res.sendStatus(200);
          //insert into notifications table
        }else{
          await transac.commit();
          throw { status:400, message:'No todo data given' }
        }
        // await notificationServices.addNotificationForUsers('',);
      }catch(exception){
        await transac.rollback();
        var error = ExceptionHandler.handleException(exception);
        res.status(error.status).json({ error: error.message });
      }
    };
  }

  static getTodo(){
    return async (req, res) => {
      try{
        const query = req.query;
        if(query.todoid || query.todoId){
          var todoId = (query.todoid != null) ? query.todoid : query.todoId;
          var todo = await baseController.getIndividual(TodoModel, todoId)[0];
          res.json(todo);
        }else if(query.userId || query.userid){
          //find by user id
          var userId = (query.userId != null) ? query.userId : query.userid;
          var logs = await todoController.getTodoByUserId(userId);
          if(!logs || !logs.length){
            res.json([{}]);
          }else{
            res.json(logs);
          }
        }else if(query.farmId || query.farmid){
          //get todos by farm id
          var farmId = (query.farmId != null) ? query.farmId : query.farmid;
          var todoLogs = await await TodoModel.query().where('farm_id', farmId).skipUndefined();
          if(!todoLogs || !todoLogs.length){
            res.json([]);
          }else{
            res.json(todoLogs);
          }
        }else{
          res.status(200).json([]);
        }
      }catch(exception){
        const error = ExceptionHandler.handleException(exception);
        res.status(error.status).json({ error:error.message });
      }

    }
  }

  static patchTodo(){
    return async (req, res) => {
      try{
        if(req.params.id && req.body){
          await baseController.updateIndividualById(TodoModel, req.params.id, req.body);
          res.sendStatus(200);
        }else{
          throw { status:400, message:'Todo id and patch is required' }//throw an exception
        }
      }
      catch(exception){
        const error = ExceptionHandler.handleException(exception);
        res.status(error.status).json({ error:error.message });
      }
    }
  }

  static deleteTodo(){
    return async (req, res) => {
      try{
        if(req.params.id){
          await baseController.delete(TodoModel, req.params.id);
          res.sendStatus(200);
        }else{
          throw { status:400, message:'Todo id is required' }
        }
      }catch(exception){
        //HANDLE USER UNABLE TO DELETE
        const error = ExceptionHandler.handleException(exception);
        res.status(error.status).json({ error: error.message });
      }
    }
  }

  static async addNotificationForUsers(userIdArray, notificationKind, transaction = null){
    //if it is an array object
    let objectToInsert;
    if(Array.isArray(userIdArray)){
      objectToInsert = userIdArray.map((userId)=>{
        return { user_id:userId, notification_kind:notificationKind }
      });
    }else{
      objectToInsert = { user_id:userIdArray, notification_kind:notificationKind };
    }
    return await super.post(notificationModel, objectToInsert, transaction);
  }

  static async insertTodo(data, transaction){
    const todo = await super.post(TodoModel, data, transaction);
    const users = data.users.map(user => {
      return { 'user_id': user }
    });
    return await super.postRelated(todo, userTodo, users, transaction);
  }

  static async getTodoByUserId(userId){
    var todos = await userTodo.query().where('user_id', userId).eager(TodoModel.tableName);
    return todos.map(todo=>todo.todo);
  }
}

module.exports = todoController;
