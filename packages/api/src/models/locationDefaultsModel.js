import BaseModel from './baseModel.js';
import { Model } from 'objection';
import locationModel from './locationModel.js';

class LocationDefaultsModel extends BaseModel {
  static get tableName() {
    return 'location_defaults';
  }

  static get idColumn() {
    return 'location_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['location_id'],
      properties: {
        location_id: { type: 'string' },
        irrigation_task_type: { type: 'string' },
        estimated_flow_rate: { type: 'float' },
        estimated_flow_rate_unit: { type: 'string' },
        application_depth: { type: 'float' },
        application_depth_unit: { type: 'string' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }
  static get relationMappings() {
    return {
      location: {
        relation: Model.BelongsToOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: locationModel,
        join: {
          from: 'location_defaults.location_id',
          to: 'location.location_id',
        },
      },
    };
  }
  static async createOrUpdateLocationDefaults({ location_defaults }) {
    for (const location_default of location_defaults) {
      await LocationDefaultsModel.transaction(async (trx) => {
        await LocationDefaultsModel.query(trx)
          .context({ location_id: location_default.location_id })
          .upsertGraph({ ...location_default }, { insertMissing: true });
      });
    }
  }
}
export default LocationDefaultsModel;
