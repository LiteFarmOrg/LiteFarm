import { Model } from 'objection';
import knex from '../util/knex.js';
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

  static async insertCustomIrrigationType(row) {
    await knex('irrigation_type').insert(row);
    const irrigationTypeNames = await knex('irrigation_type').select('irrigation_type_name');
    const irrigationTaskTypes = await knex('irrigation_task').select('type');
    const irrigationTypeEnums = irrigationTypeNames.map((type) => type.irrigation_type_name);
    const irrigationTaskTypeEnums = irrigationTaskTypes.map((type) => type.type);
    await knex.schema.raw(`ALTER TABLE irrigation_task DROP CONSTRAINT "irrigationLog_type_check";
                          ALTER TABLE irrigation_task ADD CONSTRAINT "irrigationLog_type_check" 
                           CHECK (type = ANY (ARRAY['${[
                             ...new Set(irrigationTypeEnums.concat(irrigationTaskTypeEnums)),
                           ].join(`'::text,'`)}'::text]))`);
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
    const data = await IrrigationTypesModel.knex().raw(
      `SELECT farm_id, default_measuring_type, irrigation_type_name as value FROM public.irrigation_type WHERE farm_id = ? OR farm_id IS NULL`,
      [farm_id],
    );
    return data.rows;
  }
}
export default IrrigationTypesModel;
