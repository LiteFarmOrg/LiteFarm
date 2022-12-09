import { Model } from 'objection';

class LocationDefaultsModel extends Model {
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
      },
      additionalProperties: false,
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
