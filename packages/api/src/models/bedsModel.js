const Model = require('objection').Model;

class BedsModel extends Model {
  static get tableName() {
    return 'beds';
  }

  static get idColumn() {
    return 'management_plan_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['location_id'],
      properties: {
        management_plan_id: { type: 'integer' },
        area_used: { type: 'float', minimum: 0 },
        area_used_unit: { type: 'number', enum: ['m2', 'ha', 'ft2', 'ac'] },
        bed_config: { type: 'object, null' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {};
  }
}

module.exports = BedsModel;
