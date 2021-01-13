const Model = require('objection').Model;

class emailTokenModel extends Model {
  static get tableName() {
    return 'emailToken';
  }

  static get idColumn() {
    return ['invitation_id'];
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'farm_id'],

      properties: {
        user_id: { type: 'string' },
        farm_id: { type: 'string' },
        invitation_id: { type: 'string' },
        times_sent: { type: 'integer' },
        created_at: { type: 'date-time' },
        updated_at: { type: 'date-time' },
      },
      additionalProperties: false,
    };
  }
}

module.exports = emailTokenModel;
