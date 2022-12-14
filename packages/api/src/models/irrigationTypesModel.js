import knex from '../util/knex.js';
import BaseModel from './baseModel.js';

class IrrigationTypesModel extends BaseModel {
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
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static async insertCustomIrrigationType(row) {
    await knex('irrigation_type').insert(row);
    const irrigationType = await knex('irrigation_type')
      .select('irrigation_type_id')
      .where({ irrigation_type_name: row.irrigation_type_name });
    return irrigationType[0];
  }

  static async updateIrrigationType(irrigationTypeValues) {
    const { irrigation_type_id, ...rest } = irrigationTypeValues;
    IrrigationTypesModel.query()
      .where('irrigation_type_id', irrigation_type_id)
      .patch({
        ...rest,
      })
      .returning('*');
  }
  static async getAllIrrigationTaskTypesByFarmId(farm_id) {
    return IrrigationTypesModel.query()
      .select('*')
      .where((builder) => {
        builder.whereNull('farm_id').orWhere({ farm_id });
      });
  }
}
export default IrrigationTypesModel;
