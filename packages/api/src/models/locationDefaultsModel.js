import BaseModel from './baseModel.js';

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
  static async createOrUpdateLocationDefaults(location_defaults) {
    const { user_id, ...rest } = location_defaults;
    await LocationDefaultsModel.query()
      .context({ user_id })
      .upsertGraph({ ...rest }, { insertMissing: true });
  }
}
export default LocationDefaultsModel;
