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

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable('soil_analysis_report', (table) => {
    table.increments('id').primary();
    table.uuid('document_id').references('document_id').inTable('document');
    table.enu('status', ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED']).notNullable();
    table.string('error_message');
  });

  await knex.schema.createTable('soil_analyte', (table) => {
    table.increments('id').primary();
    table.string('key').notNullable().unique();
  });

  await knex.schema.createTable('soil_analysis_sample', (table) => {
    table.increments('id').primary();
    table.integer('report_id').references('id').inTable('soil_analysis_report').notNullable();
    table.uuid('location_id').references('location_id').inTable('location');
    table.jsonb('depths').notNullable();
    table.enu('depths_unit', ['cm', 'in']).notNullable().defaultTo('cm');
    table.string('external_id').notNullable();
    table.date('date_collected').notNullable();
    // Not using these yet
    table.float('weight_value');
    table.enu('weight_unit', ['lb', 'kg']).defaultTo('kg');
  });

  await knex.schema.createTable('soil_analysis_result', (table) => {
    table.increments('id').primary();
    table.integer('sample_id').references('id').inTable('soil_analysis_sample').notNullable();
    table.integer('analyte_id').references('id').inTable('soil_analyte').notNullable();
    table.float('value').notNullable();
    table.string('unit').notNullable();
    // Not using these yet
    table.string('method');
    table.string('method_reference');
    table.float('detectable_limit');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTableIfExists('soil_analysis_result');
  await knex.schema.dropTableIfExists('soil_analysis_sample');
  await knex.schema.dropTableIfExists('soil_analysis_report');
  await knex.schema.dropTableIfExists('soil_analyte');
};
