/*
 *  Copyright (c) 2025 LiteFarm.org
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
  // WARNING: Will delete all existing sensors data except for 'integrating_partner'
  await knex.schema.dropTable('sensor_reading');
  await knex.schema.dropTable('sensor_reading_type');
  await knex.schema.dropTable('sensor');
  await knex.schema.dropTable('partner_reading_type');
  await knex.schema.dropTable('farm_external_integration');

  // Add inbound integration type
  await knex.schema.createTable('inbound_integration_type', (table) => {
    table.increments('id').primary();
    table.string('type').notNullable();
  });

  await knex('inbound_integration_type').insert([
    { type: 'SENSOR_READING' },
    { type: 'IRRIGATION_PRESCRIPTION' },
  ]);

  // Create farm inbound integration
  await knex.schema.createTable('farm_inbound_integration', (table) => {
    table.primary(['farm_id', 'partner_id']);
    // New notNullable constraints on farm_id and partner_id since null != null violating our original intention for primary key
    table.uuid('farm_id').references('farm_id').inTable('farm').notNullable();
    table
      .integer('partner_id')
      .references('partner_id')
      .inTable('integrating_partner')
      .notNullable();
    table.uuid('organization_uuid').nullable();
    table.integer('webhook_id').nullable();
    table.integer('type_id').references('id').inTable('inbound_integration_type').notNullable();
  });

  // Create sensor manufacturer table
  await knex.schema.createTable('sensor_manufacturer', (table) => {
    table.increments('id').primary();
    // references name on integrating_partner if integrating_partner_id exists
    table.string('name').notNullable();
    table.uuid('farm_id').references('farm_id').inTable('farm').nullable();
    table
      .integer('integrating_partner_id')
      .references('partner_id')
      .inTable('integrating_partner')
      .notNullable();
  });

  // Create sensor_array table
  await knex.schema.createTable('sensor_array', (table) => {
    // Other locations seem to use .onDelete('CASCADE') but I don't think it is appropriate
    table.uuid('location_id').primary().references('location_id').inTable('location').notNullable();
    table.uuid('field_location_id').references('location_id').inTable('field').notNullable();
  });

  // Add inbound integration type
  await knex.schema.createTable('sensor_status', (table) => {
    table.increments('id').primary();
    table.string('key').notNullable();
  });

  await knex('sensor_status').insert([{ key: 'ONLINE' }, { key: 'OFFLINE' }]);

  // Create sensor table
  await knex.schema.createTable('sensor', (table) => {
    table.increments('id').primary();
    table.string('name').nullable();
    // Contrains sensor to arrays instead of all locations
    table.uuid('location_id').references('location_id').inTable('sensor_array').notNullable();
    // changed from notNullable
    table.string('external_id').nullable();
    table
      .integer('sensor_manufacturer_id')
      .references('id')
      .inTable('sensor_manufacturer')
      .nullable();
    table.check(
      '(?? IS NULL AND ?? IS NULL) OR (?? IS NOT NULL AND ?? IS NOT NULL)',
      ['external_id', 'sensor_manufacturer_id', 'external_id', 'sensor_manufacturer_id'],
      'external_data_check',
    );
    table.string('model');
    // combining depth and elevation
    table.float('depth_elevation').nullable();
    // removing defaultTo('cm')
    table.enu('depth_elevation_unit', ['cm', 'm', 'in', 'ft']).nullable();
    table.check(
      '(?? IS NULL AND ?? IS NULL) OR (?? IS NOT NULL AND ?? IS NOT NULL)',
      ['depth_elevation', 'depth_elevation_unit', 'depth_elevation', 'depth_elevation_unit'],
      'depth_elevation_unit_check',
    );
    table.boolean('retired').notNullable().defaultTo('false');
    table.boolean('deleted').notNullable().defaultTo('false');
  });

  // Refactor sensor_reading_type - references partner_reading_type, sensor_reading_type
  await knex.schema.createTable('sensor_reading_type', (table) => {
    table.increments('id').primary();
    table.string('type').notNullable();
    table.string('unit').notNullable();
  });

  await knex('sensor_reading_type').insert([
    { type: 'temperature', unit: 'C' },
    { type: 'soil_water_potential', unit: 'kPa' },
    { type: 'soil_water_content', unit: 'mm' },
  ]);

  // Create relationship table
  await knex.schema.createTable('sensor_reading_mode', (table) => {
    table.integer('sensor_id').references('id').inTable('sensor').notNullable();
    table
      .integer('sensor_reading_type_id')
      .references('id')
      .inTable('sensor_reading_type')
      .notNullable();
  });

  // Create sensor reading table
  await knex.schema.createTable('sensor_reading', (table) => {
    table.increments('id').primary();
    table.integer('sensor_id').references('id').inTable('sensor').notNullable();
    table
      .integer('sensor_reading_type_id')
      .references('id')
      .inTable('sensor_reading_type')
      .notNullable();
    table.timestamp('created_at').notNullable();
    table.float('value').notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  // WARNING: Will delete all existing sensors data except for 'integrating_partner'
  await knex.schema.dropTable('sensor_reading');
  await knex.schema.dropTable('sensor_reading_mode');
  await knex.schema.dropTable('sensor_reading_type');
  await knex.schema.dropTable('sensor');
  await knex.schema.dropTable('sensor_status');
  await knex.schema.dropTable('sensor_array');
  await knex.schema.dropTable('sensor_manufacturer');
  await knex.schema.dropTable('farm_inbound_integration');
  await knex.schema.dropTable('inbound_integration_type');

  // Recreate farm_external_integration - from /20220610171713_create-farm-external-integrations-table.js
  // Including alteration from webhook address to webhook id
  await knex.schema.createTable('farm_external_integration', (table) => {
    table.primary(['farm_id', 'partner_id']);
    table.uuid('farm_id').references('farm_id').inTable('farm');
    table.integer('partner_id').references('partner_id').inTable('integrating_partner');
    table.uuid('organization_uuid');
    table.integer('webhook_id');
  });

  // Recreate partner reading type - from /20220614195741_sensor_reading_types.js
  await knex.schema.createTable('partner_reading_type', (table) => {
    table
      .uuid('partner_reading_type_id')
      .primary()
      .notNullable()
      .defaultTo(knex.raw('uuid_generate_v1()'));
    table
      .integer('partner_id')
      .references('partner_id')
      .inTable('integrating_partner')
      .notNullable();
    table.integer('raw_value');
    table.string('readable_value');
  });

  await knex('partner_reading_type').insert([
    {
      partner_id: 1,
      readable_value: 'soil_water_content',
    },
    {
      partner_id: 1,
      readable_value: 'soil_water_potential',
    },
    {
      partner_id: 1,
      readable_value: 'temperature',
    },
  ]);

  // Recreate sensor table - from /20220715214935_sensor_as_standard_location.js
  // Including alteration to depth_unit
  await knex.schema.createTable('sensor', function (table) {
    table
      .uuid('location_id')
      .primary()
      .notNullable()
      .references('location_id')
      .inTable('location')
      .unique()
      .onDelete('CASCADE');
    table
      .integer('partner_id')
      .references('partner_id')
      .inTable('integrating_partner')
      .notNullable();
    table.string('external_id').notNullable();
    table.float('depth');
    table.enu('depth_unit', ['cm', 'm', 'in', 'ft']).defaultTo('cm');
    table.float('elevation');
    table.string('model');
  }),
    // Rebuild sensor reading type - from /20220715214935_sensor_as_standard_location.js
    await knex.schema.createTable('sensor_reading_type', function (table) {
      table
        .uuid('sensor_reading_type_id')
        .primary()
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v1()'));
      table
        .uuid('partner_reading_type_id')
        .references('partner_reading_type_id')
        .inTable('partner_reading_type');
      table.uuid('location_id').references('location_id').inTable('sensor').onDelete('CASCADE');
    });

  // Rebuild sensor reading type - from /20220715214935_sensor_as_standard_location.js
  await knex.schema.createTable('sensor_reading', function (table) {
    table.uuid('reading_id').primary().notNullable().defaultTo(knex.raw('uuid_generate_v1()'));
    table
      .uuid('location_id')
      .notNullable()
      .references('location_id')
      .inTable('sensor')
      .onDelete('CASCADE');
    table.timestamp('read_time').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.string('reading_type').notNullable();
    table.float('value').notNullable();
    table.string('unit').notNullable();
    table.boolean('valid').notNullable().defaultTo(true);
  });
};
