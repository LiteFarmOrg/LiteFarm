import Model from './baseFormatModel.js';

class BedMethodModel extends Model {
  static get tableName() {
    return 'bed_method';
  }

  static get idColumn() {
    return 'planting_management_plan_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'planting_management_plan_id',
        'number_of_beds',
        'number_of_rows_in_bed',
        'plant_spacing',
        'bed_length',
      ],
      properties: {
        planting_management_plan_id: { type: 'string' },
        number_of_beds: { type: 'integer' },
        number_of_rows_in_bed: { type: 'integer' },
        plant_spacing: { type: 'number' },
        plant_spacing_unit: { type: 'string', enum: ['cm', 'm', 'ft', 'in'] },
        bed_length: { type: ['number', 'null'] },
        bed_length_unit: { type: ['string'], enum: ['cm', 'm', 'ft', 'in'] },
        planting_depth: { type: ['number', 'null'] },
        planting_depth_unit: { type: ['string'], enum: ['cm', 'm', 'ft', 'in'] },
        bed_width: { type: ['number', 'null'] },
        bed_width_unit: { type: ['string'], enum: ['cm', 'm', 'ft', 'in'] },
        bed_spacing: { type: ['number', 'null'] },
        bed_spacing_unit: { type: ['string'], enum: ['cm', 'm', 'ft', 'in'] },
        specify_beds: { type: ['string', 'null'] },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {};
  }

  // Custom function used in copy crop plan
  // Should contain all jsonSchema() and relationMappings() keys
  static get templateMappingSchema() {
    return {
      // jsonSchema()
      planting_management_plan_id: 'edit',
      number_of_beds: 'keep',
      number_of_rows_in_bed: 'keep',
      plant_spacing: 'keep',
      plant_spacing_unit: 'keep',
      bed_length: 'keep',
      bed_length_unit: 'keep',
      planting_depth: 'keep',
      planting_depth_unit: 'keep',
      bed_width: 'keep',
      bed_width_unit: 'keep',
      bed_spacing: 'keep',
      bed_spacing_unit: 'keep',
      specify_beds: 'keep',
      // relationMappings
    };
  }
}

export default BedMethodModel;
