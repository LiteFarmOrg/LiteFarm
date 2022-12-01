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
    // insert into irrigation_type table
    await knex('irrigation_type').insert(row);

    // update irrigation_task type column enum constraint
    const irrigation_type_names = await knex('irrigation_type').select('irrigation_type_name');
    const irrigation_task_types = await knex('irrigation_task').select('type');
    const irrigation_type_enums = irrigation_type_names.map((type) => type.irrigation_type_name);
    const irrigation_task_type_enums = irrigation_task_types.map((type) => type.type);
    await knex.schema.raw(`ALTER TABLE irrigation_task DROP CONSTRAINT "irrigationLog_type_check";
                          ALTER TABLE irrigation_task ADD CONSTRAINT "irrigationLog_type_check" 
                           CHECK (type = ANY (ARRAY['${[
                             ...new Set(irrigation_type_enums.concat(irrigation_task_type_enums)),
                           ].join(`'::text,'`)}'::text]))`);
  }
}
export default IrrigationTypesModel;
