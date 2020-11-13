const Model = require('objection').Model;
const softDelete = require('objection-soft-delete');
// Step 2: Create baseModel with baseProperties
function baseModel(){
  return class extends softDelete({ columnName: 'deleted' })(Model) {
    $beforeInsert(context) {
      const user_id = context.user_id;
      if (user_id) {
        this.created_by_user_id = user_id;
        this.updated_by_user_id = user_id;
        delete this.user_id;
      }
      this.created_at = new Date().toISOString();
      this.updated_at = this.created_at;
    }

    $beforeUpdate(opt, context) {
      const user_id = context.user_id;
      if (user_id) {
        this.updated_by_user_id = user_id;
        delete this.user_id;
      }
      this.updated_at = new Date().toISOString();
    }

    static get baseProperties() {
      return ({
        created_by_user_id: { type: 'string' },
        updated_by_user_id: { type: 'string' },
        created_at: { type: 'date-time' },
        updated_at: { type: 'date-time' },
        deleted: { type: 'boolean' },
      })
    }
  }
}


module.exports = baseModel;

