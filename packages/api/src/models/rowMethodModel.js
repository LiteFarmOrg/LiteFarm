import Model from './baseFormatModel.js';

class RowMethodModel extends Model {
  static get tableName() {
    return 'row_method';
  }

  static get idColumn() {
    return 'planting_management_plan_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['planting_management_plan_id', 'same_length', 'plant_spacing'],
      properties: {
        planting_management_plan_id: { type: 'string' },
        same_length: { type: 'boolean' },
        number_of_rows: { type: ['integer', 'null'] },
        row_length: { type: ['number', 'null'] },
        row_length_unit: { type: 'string', enum: ['cm', 'm', 'in', 'ft'] },
        plant_spacing: { type: ['number'] },
        plant_spacing_unit: { type: 'string', enum: ['cm', 'm', 'in', 'ft'] },
        total_rows_length: { type: ['number', 'null'] },
        total_rows_length_unit: { type: 'string', enum: ['cm', 'm', 'in', 'ft'] },
        specify_rows: { type: ['string', 'null'] },
        planting_depth: { type: ['number', 'null'] },
        planting_depth_unit: { type: 'string', enum: ['cm', 'm', 'in', 'ft'] },
        row_width: { type: ['number', 'null'] },
        row_width_unit: { type: 'string', enum: ['cm', 'm', 'in', 'ft'] },
        row_spacing: { type: ['number', 'null'] },
        row_spacing_unit: { type: 'string', enum: ['cm', 'm', 'in', 'ft'] },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {};
  }
}

export default RowMethodModel;
