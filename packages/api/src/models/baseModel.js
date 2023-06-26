import Model from './baseFormatModel.js';

// TODO: Deprecate objection soft delete
import softDelete from 'objection-soft-delete';
// Patch for mergeContext deprecation from objection
import { QueryBuilder } from 'objection';
QueryBuilder.prototype.mergeContext = QueryBuilder.prototype.context;

class BaseModel extends softDelete({ columnName: 'deleted' })(Model) {
  // Returned Date-time object from db is not compatible with ajv format types
  // Server.js function changes date to datetime -- here we change it back: see LF-3396
  $parseJson(json, opt) {
    json = super.$parseJson(json, opt);
    if (json.created_at && typeof json.created_at === 'object') {
      json.created_at = json.created_at.toISOString();
    }
    if (json.updated_at && typeof json.updated_at === 'object') {
      json.updated_at = json.updated_at.toISOString();
    }
    const pgDateTypeFields = [
      'abandon_date',
      'complete_date',
      'due_date',
      'effective_date',
      'germination_date',
      'harvest_date',
      'plant_date',
      'seed_date',
      'start_date',
      'termination_date',
      'transition_date',
      'transplant_date',
      'valid_until',
    ];
    if (Object.keys(json).some((e) => pgDateTypeFields.includes(e))) {
      Object.keys(json).forEach((key) => {
        if (pgDateTypeFields.includes(key) && json[key]) {
          json[key] = json[key].split('T')[0];
        }
      });
    }
    return json;
  }

  async $beforeInsert(context) {
    await super.$beforeInsert(context);
    const user_id = context.user_id;
    if (!user_id) throw new Error('user_id must by passed into context on update');
    if (user_id) {
      this.created_by_user_id = user_id;
      this.updated_by_user_id = user_id;
    }
    // BeforeInsert not validated with jsonSchema, thus null type allowance
    this.created_at = new Date().toISOString();
    this.updated_at = this.created_at;
  }

  async $beforeUpdate(opt, context) {
    await super.$beforeUpdate(opt, context);
    const user_id = context.user_id;
    if (!user_id) throw new Error('user_id must by passed into context on update');
    else {
      this.updated_by_user_id = user_id;
    }
    this.updated_at = new Date().toISOString();
    delete this.created_by_user_id;
    delete this.created_at;
  }

  async $beforeDelete(context) {
    await super.$beforeDelete(context);
    const user_id = context.user_id;
    if (!user_id) throw new Error('user_id must by passed into context on update');
    else {
      this.updated_by_user_id = user_id;
    }
    this.updated_at = new Date().toISOString();
    delete this.created_by_user_id;
    delete this.created_at;
  }

  static get hidden() {
    return ['created_at', 'created_by_user_id', 'updated_by_user_id', 'updated_at', 'deleted'];
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

  static get baseProperties() {
    return {
      created_by_user_id: { type: 'string' },
      updated_by_user_id: { type: 'string' },
      created_at: {
        type: ['string'],
        format: 'date-time',
      },
      updated_at: {
        type: ['string'],
        format: 'date-time',
      },
      deleted: { type: 'boolean' },
    };
  }
}

export default BaseModel;
