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
      required: ['irrigation_type_name'],
      properties: {
        irrigation_type_id: { type: 'string' },
        irrigation_type_name: { type: 'string', uniqueItems: true },
        farm_id: { type: 'string' },
        default_measuring_type: { type: 'string' },
        default_irrigation_task_type_measurement: { type: 'boolean' },
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
    IrrigationTypesModel.query()
      .where('irrigation_type_name', irrigationTypeValues.irrigation_type_name)
      .patch({
        default_measuring_type: irrigationTypeValues.default_measuring_type,
        farm_id: irrigationTypeValues.farm_id,
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
