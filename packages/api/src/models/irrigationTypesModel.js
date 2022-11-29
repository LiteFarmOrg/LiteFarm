import { Model } from 'objection';
class IrrigationTypesModel extends Model {
  static get tableName() {
    return 'irrigation_type';
  }

  static get idColumn() {
    return 'irrigation_type_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [''],
      properties: {
        irrigation_type_id: { type: 'string' },
        irrigation_type_name: { type: 'string' },
        farm_id: { type: 'string' },
        default_measuring_type: { type: 'string' },
      },
      additionalProperties: false,
    };
  }
}
export default IrrigationTypesModel;
