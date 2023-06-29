import PartnerReadingTypesModel from './PartnerReadingTypeModel.js';
import Model from './baseFormatModel.js';

class SensorReadingTypeModel extends Model {
  /**
   * Identifies the database table for this Model.
   * @static
   * @returns {string} Names of the database table.
   */
  static get tableName() {
    return 'sensor_reading_type';
  }

  /**
   * Identifies the primary key fields for this Model.
   * @static
   * @returns {string[]} Names of the primary key fields.
   */
  static get idColumn() {
    return ['sensor_reading_type_id'];
  }

  /**
   * Supports validating instances of this Model class.
   * @static
   * @returns {Object} A description of valid instances.
   */
  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        sensor_reading_type_id: { type: 'string' },
        partner_reading_type_id: { type: 'string' },
        location_id: { type: 'string' },
      },
    };
  }

  /**
   * Defines this Model's associations with other Models.
   * @static
   * @returns {Object} A description of Model associations.
   */
  static get relationMappings() {
    return {
      partnerReadingType: {
        modelClass: PartnerReadingTypesModel,
        relation: Model.HasOneRelation,
        join: {
          from: 'sensor_reading_type.partner_reading_type_id',
          to: 'partner_reading_type.partner_reading_type_id',
        },
      },
    };
  }
}

export default SensorReadingTypeModel;
