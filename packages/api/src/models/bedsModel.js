const Model = require('objection').Model;

class BedsModel extends Model {
  static get tableName() {
    return 'beds';
  }

  static get idColumn() {
    return 'management_plan_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['location_id'],
      properties: {
        management_plan_id: { type: 'integer' },
        area_used: { type: 'float', minimum: 0 },
        area_used_unit: { type: 'number', enum: ['m2', 'ha', 'ft2', 'ac'] },
        bed_config: { type: 'object, null' },
        number_of_beds: { type: 'integer' },
        number_of_rows_in_bed: { type: 'integer' },
        plant_spacing_unit: { type: 'number', enum: ['cm', 'm', 'ft', 'in'] },
        plant_spacing: { type: ['number'] },
        length_of_bed_unit: { type: 'number', enum: ['cm', 'm', 'ft', 'in'] },
        length_of_bed: { type: ['number'] },
        specify_beds: { type: ['string'] },
        planting_depth: { type: ['number'] },
        planting_depth_unit: { type: 'number', enum: ['cm', 'm', 'ft', 'in'] },
        bed_width: { type: ['number'] },
        bed_width_unit: { type: 'number', enum: ['cm', 'm', 'ft', 'in'] },
        bed_spacing: { type: ['number'] },
        bed_spacing_unit: { type: 'number', enum: ['cm', 'm', 'ft', 'in'] },
        planting_notes: { type: ['string'] },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {};
  }
}

module.exports = BedsModel;
