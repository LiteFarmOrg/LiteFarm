import Model from './baseFormatModel.js';
import softDelete from 'objection-soft-delete';

class BaseModel extends softDelete({ columnName: 'deleted' })(Model) {
  async $beforeInsert(context) {
    await super.$beforeInsert(context);
    const user_id = context.user_id;
    if (!user_id) throw new Error('user_id must by passed into context on update');
    if (user_id) {
      this.created_by_user_id = user_id;
      this.updated_by_user_id = user_id;
    }
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
        type: 'string',
        format: 'date-time',
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
      },
      deleted: { type: 'boolean' },
    };
  }
}

export default BaseModel;
