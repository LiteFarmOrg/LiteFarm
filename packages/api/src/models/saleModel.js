/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (saleModel.js) is part of LiteFarm.
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

import baseModel from './baseModel.js';
import cropVarietySaleModel from './cropVarietySaleModel.js';
import generalSaleModel from './generalSaleModel.js';

class Sale extends baseModel {
  static get tableName() {
    return 'sale';
  }

  static get idColumn() {
    return 'sale_id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['customer_name', 'sale_date', 'farm_id', 'revenue_type_id'],

      properties: {
        sale_id: { type: 'integer' },
        customer_name: { type: 'string', minLength: 1, maxLength: 255 },
        sale_date: { type: 'string', minLength: 1, maxLength: 255 },
        farm_id: { type: 'string' },
        revenue_type_id: { type: 'integer' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      // crop: {
      //   modelClass:require('./cropModel'),
      //   relation: Model.ManyToManyRelation,
      //   join:{
      //     from: 'sale.sale_id',
      //     through: {
      //       modelClass: require('./cropVarietySaleModel'),
      //       from: 'crop_variety_sale.sale_id',
      //       to: 'crop_variety_sale.crop_id',
      //     },
      //     to: 'crop.crop_id',
      //   },
      // },
      crop_variety_sale: {
        relation: Model.HasManyRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: cropVarietySaleModel,
        join: {
          from: 'sale.sale_id',
          to: 'crop_variety_sale.sale_id',
        },
      },
      general_sale: {
        relation: Model.HasOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: generalSaleModel,
        join: {
          from: 'sale.sale_id',
          to: 'general_sale.sale_id',
        },
      },
    };
  }
}

export default Sale;
