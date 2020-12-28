/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (baseController.js) is part of LiteFarm.
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

const lodash = require('lodash');

class baseController {
  static async get(model) {
    if(model.isSoftDelete){
      return await model.query().whereNotDeleted().skipUndefined();
    }
    return await model.query().skipUndefined()
  }

  static async post(model, data, transaction, context = {}) {
    data = removeAdditionalProperties(model, data);
    return await model.query(transaction).context(context).insert(data);
  }

  // send back the resource that was just created
  static async postWithResponse(model, data, transaction, context = {}) {
    // TODO: replace removeAdditionalProperties. Additional properties should trigger an error.
    return model.query(transaction).context(context)
      .insert(removeAdditionalProperties(model, data)).returning('*');
  }

  static async postRelated(model, subModel, data, transaction){
    if(!Array.isArray(data)){ //if data is not an array
      data = removeAdditionalProperties(subModel, data);
    }

    if(!lodash.isEmpty(data)){
      return await model
        .$relatedQuery(subModel.tableName, transaction)
        .insert(data);
    }else{
      return;
    }
  }

  // creates a relation between two tables in the database. If there is a many to many relation,
  // the join table is updated with a new tuple
  static async relateModels(model, subModel, data, transaction){
    if(!Array.isArray(data)){ //if data is not an array
      data = removeAdditionalProperties(subModel, data);
    }
    const ids = [];
    data.map((d) => Object.keys(d).map((k) => ids.push(d[k])));
    if(!lodash.isEmpty(data)){
      // unrelate first so that any objects not in array are deleted
      await model.$relatedQuery(subModel.tableName, transaction).unrelate();
      for (const id of ids) {
        // then relate new objects in array
        await model
          .$relatedQuery(subModel.tableName, transaction)
          .relate(id);
      }
      return
    }else{
      return
    }
  }

  static async put(model, id, data, transaction=null, context = {}) {
    // sometime id can be read as a string instead
    // obtain attributes from model
    const resource = removeAdditionalProperties(model, data);
    // put to database
    const table_id = model.idColumn;
    // check if path id matches id provided from body
    return await model.query(transaction).context(context)
      .where(table_id, id).update(resource).returning('*');
  }

  static async delete(model, id, transaction=null) {
    const table_id = model.idColumn;
    return await model.query(transaction).where(table_id, id).delete()
  }

  static async getIndividual(model, id) {
    const table_id = model.idColumn;
    if(model.isSoftDelete){
      return await model.query().whereNotDeleted().where(table_id, id);
    }
    return await model.query().where(table_id, id)
  }

  static async getByFieldId(model, field, fieldId){
    if(model.isSoftDelete){
      return await model.query().whereNotDeleted().where(field, fieldId);
    }
    const data = await model.query().where(field, fieldId);
    return data;
  }
  static async getByForeignKey(model, field, fieldId){
    if(model.isSoftDelete){
      const data =await model.query().whereNotDeleted().where(field, fieldId);
      return data;
    }
    const data = await model.query().where(field, fieldId);
    return data;
  }

  static async updateIndividualById(model, id, updatedLog, transaction=null, context = {}){
    updatedLog = removeAdditionalProperties(model, updatedLog);
    if(!lodash.isEmpty(updatedLog)){
      return await model.query(transaction).context(context)
        .patchAndFetchById(id, updatedLog);
    }

  }
  static async getRelated(model, subModel){
    return await model.$fetchGraph(subModel.tableName)
  }

  // insert object and insert, update, or delete related objects
  // see http://vincit.github.io/objection.js/#graph-upserts
  static async upsertGraph(model, data, transaction) {
    return await model.query(transaction).upsertGraph(data, { insertMissing: true });
  }

  // fetch an object and all of its related objects
  // see http://vincit.github.io/objection.js/#eager-loading
  static async eager(model, subModel, transaction) {
    return await model.query(transaction).eager(subModel);
  }
}

function removeAdditionalProperties(model, data) {
  if(Array.isArray(data)){
    const arrayWithoutAdditionalProperties = data.map((obj)=>{
      return lodash.pick(obj, Object.keys(model.jsonSchema.properties));
    });
    return arrayWithoutAdditionalProperties;
  }
  //remove all the unnecessary properties

  return lodash.pick(data, Object.keys(model.jsonSchema.properties));
}


module.exports = baseController;
//export transaction;
