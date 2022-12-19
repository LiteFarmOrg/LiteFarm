import knex from '../util/knex.js';
import BaseModel from './baseModel.js';
import { Model } from 'objection';
import IrrigationTaskModel from './irrigationTaskModel.js';

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

  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      irrigation_task: {
        relation: Model.BelongsToOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: IrrigationTaskModel,
        join: {
          from: 'irrigation_task.irrigation_type_id',
          to: 'irrigation_type.irrigation_type_id',
        },
      },
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
    const { user_id, irrigation_type_id, ...rest } = irrigationTypeValues;
    return await IrrigationTypesModel.query()
      .context({ user_id })
      .findById(irrigation_type_id)
      .patch({ ...rest });
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
