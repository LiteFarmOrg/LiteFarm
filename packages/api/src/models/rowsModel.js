const Model = require('objection').Model;

class RowsModel extends Model {
  static get tableName() {
    return 'rows';
  }

  static get idColumn() {
    return 'management_plan_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['management_plan_id'],
      properties: {
        management_plan_id: { type: 'number' },
        same_length: { type: 'boolean' },
        number_of_rows: { type: ['integer', null] },
        row_length: { type: ['number', null] },
        row_length_unit: { type: 'string', enum: ['cm', 'm', 'km', 'in', 'ft', 'mi'] },
        plant_spacing: { type: ['number', null] },
        plant_spacing_unit: { type: 'string', enum: ['cm', 'm', 'km', 'in', 'ft', 'mi'] },
        total_rows_length: { type: ['number', null] },
        total_rows_length_unit: { type: 'string', enum: ['cm', 'm', 'km', 'in', 'ft', 'mi'] },
        estimated_yield: { type: ['number', null] },
        estimated_yield_unit: { type: ['string', null], enum: ['g', 'lb', 'kg', 'oz', 'l', 'gal', null] },
        estimated_seeds: { type: ['number', null] },
        estimated_seeds_unit: { type: ['string', null], enum: ['g', 'lb', 'kg', 'oz', 'l', 'gal', null] },
        specify_rows: { type: ['string', null] },
        planting_depth: { type: ['number', null] },
        planting_depth_unit: { type: 'string', enum: ['cm', 'm', 'km', 'in', 'ft', 'mi'] },
        row_width: { type: ['number', null] },
        row_width_unit: { type: 'string', enum: ['cm', 'm', 'km', 'in', 'ft', 'mi'] },
        row_spacing: { type: ['number', null] },
        row_spacing_unit: { type: 'string', enum: ['cm', 'm', 'km', 'in', 'ft', 'mi'] },
        planting_notes: { type: ['string', null] },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {};
  }
}

module.exports = RowsModel;
