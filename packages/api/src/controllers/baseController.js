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

import lodash from 'lodash';

function removeAdditionalProperties(model, data) {
  if (Array.isArray(data)) {
    const arrayWithoutAdditionalProperties = data.map((obj) => {
      return lodash.pick(obj, Object.keys(model.jsonSchema.properties));
    });
    return arrayWithoutAdditionalProperties;
  }
  //remove all the unnecessary properties

  return lodash.pick(data, Object.keys(model.jsonSchema.properties));
}

export default {
  async get(model) {
    if (model.isSoftDelete) {
      return await model.query().whereNotDeleted().skipUndefined();
    }
    return await model.query().skipUndefined();
  },

  async post(model, data, req, { trx, context = {} } = {}) {
    data = removeAdditionalProperties(model, data);
    return await model
      .query(trx)
      .context({ user_id: req?.auth?.user_id, ...context })
      .insert(data);
  },

  // send back the resource that was just created
  async postWithResponse(model, data, req, { trx, context = {} } = {}) {
    // console.log(context)
    // TODO: replace removeAdditionalProperties. Additional properties should trigger an error.
    return model
      .query(trx)
      .context({ user_id: req?.auth?.user_id, ...context })
      .insert(removeAdditionalProperties(model, data))
      .returning('*');
  },

  async postRelated(model, subModel, data, req, { context = {}, trx } = {}) {
    if (!Array.isArray(data)) {
      //if data is not an array
      data = removeAdditionalProperties(subModel, data);
    }

    if (!lodash.isEmpty(data)) {
      return await model
        .$relatedQuery(subModel.tableName, trx)
        .context({ user_id: req?.auth?.user_id, ...context })
        .insert(data);
    } else {
      return;
    }
  },

  // creates a relation between two tables in the database. If there is a many to many relation,
  // the join table is updated with a new tuple
  async relateModels(model, subModel, data, trx) {
    if (!Array.isArray(data)) {
      //if data is not an array
      data = removeAdditionalProperties(subModel, data);
    }
    //TODO: remove. this will return error when object has multiple properties
    const ids = [];
    data.map((d) => Object.keys(d).map((k) => ids.push(d[k])));
    if (!lodash.isEmpty(data)) {
      // unrelate first so that any objects not in array are deleted
      await model.$relatedQuery(subModel.tableName, trx).unrelate();
      for (const id of ids) {
        // then relate new objects in array
        await model.$relatedQuery(subModel.tableName, trx).relate(id);
      }
      return;
    } else {
      return;
    }
  },

  async put(model, id, data, req, { trx = null, context = {} } = {}) {
    // sometime id can be read as a string instead
    // obtain attributes from model
    const resource = removeAdditionalProperties(model, data);
    // put to database
    const table_id = model.idColumn;
    // check if path id matches id provided from body
    return await model
      .query(trx)
      .context({ user_id: req?.auth?.user_id, ...context })
      .where(table_id, id)
      .update(resource)
      .returning('*');
  },

  async patch(model, id, data, req, { trx = null, context = {} } = {}) {
    const resource = removeAdditionalProperties(model, data);
    const table_id = model.idColumn;

    return await model
      .query(trx)
      .context({ user_id: req?.auth?.user_id, ...context })
      .where(table_id, id)
      .patch(resource);
  },

  async delete(model, id, req, { trx = null, context = {} } = {}) {
    const table_id = model.idColumn;
    return await model
      .query(trx)
      .context({ user_id: req?.auth?.user_id, ...context })
      .where(table_id, id)
      .delete();
  },

  async getIndividual(model, id) {
    const table_id = model.idColumn;
    if (model.isSoftDelete) {
      return await model.query().whereNotDeleted().where(table_id, id);
    }
    return await model.query().where(table_id, id);
  },

  async getByFieldId(model, field, fieldId) {
    if (model.isSoftDelete) {
      return await model.query().whereNotDeleted().where(field, fieldId);
    }
    const data = await model.query().where(field, fieldId);
    return data;
  },

  async getByForeignKey(model, field, fieldId) {
    if (model.isSoftDelete) {
      const data = await model.query().whereNotDeleted().where(field, fieldId);
      return data;
    }
    const data = await model.query().where(field, fieldId);
    return data;
  },

  async updateIndividualById(model, id, updatedLog, req, { trx = null, context = {} } = {}) {
    const filteredObject = removeAdditionalProperties(model, updatedLog);
    if (!lodash.isEmpty(updatedLog)) {
      return await model
        .query(trx)
        .context({ user_id: req?.auth?.user_id, ...context })
        .patchAndFetchById(id, filteredObject);
    }
  },

  async getRelated(model, subModel) {
    return await model.$fetchGraph(subModel.tableName);
  },

  // insert object and insert, update, or delete related objects
  // see http://vincit.github.io/objection.js/#graph-upserts
  async upsertGraph(model, data, req, { trx, context = {} } = {}) {
    return await model
      .query(trx)
      .context({ user_id: req?.auth?.user_id, ...context })
      .upsertGraph(data, { insertMissing: true });
  },

  // fetch an object and all of its related objects
  // see http://vincit.github.io/objection.js/#eager-loading
  async eager(model, subModel, trx) {
    return await model.query(trx).eager(subModel);
  },

  /**
   * Format transaltion key
   * @param {String} key
   * @returns {String} - Formatted key
   */
  formatTranslationKey(key) {
    return key.toUpperCase().trim().replaceAll(' ', '_');
  },
};
//export trx;
