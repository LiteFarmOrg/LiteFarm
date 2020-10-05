/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (20181215131030_consistent_units.js) is part of LiteFarm.
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

exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('fertilizerLog', (table) => {
      table.dropColumn('quantity_unit');
      table.dropColumn('quantity');
      table.float('quantity_kg')
    }),
    knex.schema.table('pestControlLog', (table) => {
      table.renameColumn('quantity', 'quantity_kg');
      table.dropColumn('quantity_unit');
    }),
    knex.schema.table('seedLog', (table) => {
      table.renameColumn('space_depth', 'space_depth_cm');
      table.renameColumn('space_length', 'space_length_cm');
      table.renameColumn('space_width', 'space_width_cm');
      table.renameColumn('rate', 'rate_seeds/m2');
      table.dropColumn('rate_unit');
      table.dropColumn('space_unit');
    }),
    knex.schema.table('soilDataLog', (table) => {
      table.renameColumn('bulk_density', 'bulk_density_kg/m3');
      table.renameColumn('depth', 'depth_cm');
      table.dropColumn('units');
      table.dropColumn('bulk_density_unit');
      table.dropColumn('start_depth');
      table.dropColumn('end_depth');
    }),
    knex.schema.table('irrigationLog', (table) => {
      table.renameColumn('flow_rate', 'flow_rate_l/min');
    }),
  ])
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('fertilizerLog', (table) => {
      table.renameColumn('quantity_kg', 'quantity');
      table.string('quantity_unit');
    }),
    knex.schema.table('pestControlLog', (table) => {
      table.renameColumn('quantity_kg', 'quantity');
      table.string('quantity_unit');
    }),
    knex.schema.table('seedLog', (table) => {
      table.renameColumn('space_depth_cm', 'space_depth');
      table.renameColumn('space_length_cm', 'space_length');
      table.renameColumn('space_width_cm', 'space_width');
      table.renameColumn('rate_seeds/m2', 'rate');
      table.string('rate_unit');
      table.string('space_unit');
    }),
    knex.schema.table('soilDataLog', (table) => {
      table.renameColumn('bulk_density_kg/m3', 'bulk_density');
      table.renameColumn('depth_cm', 'depth');
      table.enu('units', ['percentage', 'mg/kg', 'ounces/lb']);
      table.enu('bulk_density_unit', ['g/cm3', 'lb/inch3']);
      table.float('start_depth');
      table.float('end_depth');
    }),
    knex.schema.table('irrigationLog', (table) => {
      table.renameColumn('flow_rate_l/min', 'flow_rate');
    }),
  ])
};
