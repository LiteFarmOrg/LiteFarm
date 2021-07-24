const Model = require('objection').Model;

class BedMethodModel extends Model {
  static get tableName() {
    return 'bed_method';
  }

  static get idColumn() {
    return 'planting_method_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['planting_method_id', 'number_of_beds', 'number_of_rows_in_bed', 'plant_spacing', 'plant_spacing_unit', 'length_of_bed', 'length_of_bed_unit'],
      properties: {
        planting_method_id: { type: 'integer' },
        number_of_beds: { type: 'integer' },
        number_of_rows_in_bed: { type: 'integer' },
        plant_spacing: { type: 'number' },
        plant_spacing_unit: { type: 'string', enum: ['cm', 'm', 'ft', 'in'] },
        bed_length: { type: ['number', null] },
        bed_length_unit: { type: ['string'], enum: ['cm', 'm', 'ft', 'in'] },
        planting_depth: { type: ['number', null] },
        planting_depth_unit: { type: ['string'], enum: ['cm', 'm', 'ft', 'in'] },
        bed_width: { type: ['number', null] },
        bed_width_unit: { type: ['string'], enum: ['cm', 'm', 'ft', 'in'] },
        bed_spacing: { type: ['number', null] },
        bed_spacing_unit: { type: ['string'], enum: ['cm', 'm', 'ft', 'in'] },
        specify_beds: { type: ['string', null] },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {};
  }
}

module.exports = BedMethodModel;
