/*
 *  Copyright 2024 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */
import Model from './baseFormatModel.js';

class soilAmendmentProduct extends Model {
  static get tableName() {
    return 'soil_amendment_product';
  }

  static get idColumn() {
    return 'id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        product_id: { type: 'integer' },
        soil_amendment_fertiliser_type_id: { type: ['integer', 'null'] },
        n: { type: ['number', 'null'] },
        p: { type: ['number', 'null'] },
        k: { type: ['number', 'null'] },
        calcium: { type: ['number', 'null'] },
        magnesium: { type: ['number', 'null'] },
        sulfur: { type: ['number', 'null'] },
        copper: { type: ['number', 'null'] },
        manganese: { type: ['number', 'null'] },
        boron: { type: ['number', 'null'] },
        elemental_unit: { type: 'string', enum: ['percent', 'ratio', 'ppm', 'mg/kg'] },
        ammonium: { type: ['number', 'null'] },
        nitrate: { type: ['number', 'null'] },
        molecular_compounds_unit: { type: 'string', enum: ['ppm', 'mg/kg'] },
      },
      additionalProperties: false,
    };
  }
}

export default soilAmendmentProduct;
