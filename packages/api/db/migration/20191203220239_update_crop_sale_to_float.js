/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (20191203220239_update_crop_sale_to_float.js) is part of LiteFarm.
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

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.alterTable('cropSale', (table) => {
      table.float('quantity_kg').alter();
      table.float('sale_value').alter();
    }),
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.alterTable('cropSale', (table) => {
      table.integer('quantity_kg').alter();
      table.integer('sale_value').alter();
    }),
  ])
};
