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
  // WARNING: will delete all existing sensor data
  await knex.schema.dropTable('sensor_reading');

  // Create inbound integration type
  await knex.schema.createTable('inbound_integration_type', (table) => {
    table.increments('id').primary();
    table.string('type').notNullable();
  });

  const integrationTypes = await knex('inbound_integration_type')
    .insert([{ type: 'SENSOR_READING' }, { type: 'IRRIGATION_PRESCRIPTION' }])
    .returning('*');

  const sensorIntegrationType = integrationTypes.find((it) => it.type === 'SENSOR_READING');

  // Update farm inbound integration
  await knex.schema.renameTable('farm_external_integration', 'farm_inbound_integration');
  // All pre-existing at this time are of type SENSOR_READING
  await knex.schema.alterTable('farm_inbound_integration', (table) => {
    table
      .integer('type_id')
      .references('id')
      .inTable('inbound_integration_type')
      .notNullable()
      .defaultTo(sensorIntegrationType.id);
  });
  // Remove default setting
  await knex.schema.alterTable('farm_inbound_integration', (table) => {
    table.dropForeign('type_id');
    table
      .integer('type_id')
      .references('id')
      .inTable('inbound_integration_type')
      .notNullable()
      .alter();
  });

  // Create sensor manufacturer table
  await knex.schema.createTable('sensor_manufacturer', (table) => {
    table.increments('id').primary();
    // Will duplicate name on integrating_partner if integrating_partner_id exists
    table.string('name').notNullable();
    // Using null values to indicate defaults
    table.uuid('farm_id').references('farm_id').inTable('farm').nullable();
    table
      .integer('integrating_partner_id')
      .references('partner_id')
      .inTable('integrating_partner')
      .nullable();
  });

  // Create sensor_array table
  await knex.schema.createTable('sensor_array', (table) => {
    // Other locations seem to use .onDelete('CASCADE') but I don't know if it is appropriate anywmore
    table.uuid('location_id').primary().references('location_id').inTable('location').notNullable();
    // Existing sensors will have null values for field location
    table.uuid('associated_location_id').references('location_id').inTable('location').nullable();
  });

  // Create sensor status type
  await knex.schema.createTable('sensor_status', (table) => {
    table.increments('id').primary();
    table.string('key').notNullable();
  });

  await knex('sensor_status').insert([{ key: 'ONLINE' }, { key: 'OFFLINE' }]);

  // Update sensor table
  await knex.schema.renameTable('sensor', 'sensor_deleting');
  await knex.schema.createTable('sensor', (table) => {
    table.increments('id').primary();
    table.string('name').nullable();
    // Constrains sensor to arrays instead of all locations
    table.uuid('location_id').references('location_id').inTable('sensor_array').notNullable();
    // Changed from notNullable
    table.string('external_id').nullable();
    table
      .integer('sensor_manufacturer_id')
      .references('id')
      .inTable('sensor_manufacturer')
      .nullable();
    // if external_id exists then sensor manufacturer id must also exist - TODO: Backfill with partner id = 0 manufacturer?
    // table.check(
    //   '?? IS NOT NULL OR (?? IS NULL AND ?? IS NULL)',
    //   ['sensor_manufacturer_id', 'external_id', 'sensor_manufacturer_id'],
    //   'external_data_check',
    // );
    table.string('model');
    // combining depth and elevation
    table.float('depth_elevation').nullable();
    // removing defaultTo('cm')
    table.enu('depth_elevation_unit', ['cm', 'm', 'in', 'ft']).nullable();
    // New more succint way to check both null or both not null
    table.check(
      '(?? IS NULL) = (?? IS NULL)',
      ['depth_elevation', 'depth_elevation_unit'],
      'depth_elevation_unit_check',
    );
    table.boolean('retired').notNullable().defaultTo('false');
    table.boolean('deleted').notNullable().defaultTo('false');
  });

  await knex.schema.renameTable('sensor_reading_type', 'sensor_reading_type_deleting');
  // Refactor sensor_reading_type - references partner_reading_type, sensor_reading_type
  await knex.schema.createTable('sensor_reading_type', (table) => {
    table.increments('id').primary();
    table.string('type').notNullable();
    table.string('unit').notNullable();
  });

  const newReadingTypes = await knex('sensor_reading_type')
    .insert([
      { type: 'temperature', unit: 'C' },
      { type: 'soil_water_potential', unit: 'kPa' },
      { type: 'soil_water_content', unit: 'mm' },
    ])
    .returning('*');

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

  const prevSensors = await knex('sensor_deleting').select();

  // Skip data migration - Early return mostly for api tests
  if (prevSensors.length > 0) {
    const integratingPartners = await knex('integrating_partner').select();
    const farmInboundIntegrations = await knex('farm_inbound_integration').select();
    const prevSensorReadingModes = await knex('sensor_reading_type_deleting').select();
    const readingTypes = await knex('partner_reading_type').select();

    // Create manufacturer data - using map integrating partner to sensor_manufacturer
    const manufacturers = farmInboundIntegrations.map((fii) => {
      const partner = integratingPartners.find((ip) => ip.partner_id === fii.partner_id);
      if (!partner) {
        throw Error('Partner association not found');
      }
      return {
        name: partner.partner_name,
        farm_id: fii.farm_id,
        integrating_partner_id: fii.partner_id,
      };
    });

    let insertedManufacturers = [];
    if (manufacturers.length) {
      insertedManufacturers = await knex('sensor_manufacturer')
        .insert(manufacturers)
        .returning('*');
    } else {
      console.log('No manufacturerers exist');
    }

    // Create sensor array data - all existing sensors assumed to be a sensor_array of length 1, user can re-configure as needed
    const sensorArrays = prevSensors.map((s) => {
      return {
        location_id: s.location_id,
      };
    });

    if (sensorArrays.length) {
      await knex('sensor_array').insert(sensorArrays).returning('*');
    } else {
      throw Error('No sensor arrays exist');
    }

    // Migrate sensors data
    const sensorLocations = await knex('location')
      .select()
      .whereIn(
        'location_id',
        prevSensors.map((s) => s.location_id),
      );

    const newSensors = prevSensors.map((s) => {
      const location = sensorLocations.find((loc) => loc.location_id === s.location_id);
      if (!location) {
        throw Error('Location association not found');
      }
      const newManufacturer = insertedManufacturers.find((man) => man.farm_id === location.farm_id);
      const valueUnit = {};
      // Determine depth and unit
      if (s.depth >= 0 && s.depth != null) {
        valueUnit.value = -s.depth;
        valueUnit.unit = s.depth_unit;
      } else if (s.elevation >= 0 && s.elevation != null) {
        valueUnit.value = s.elevation;
        valueUnit.unit = s.depth_unit;
      } else {
        valueUnit.value = s.depth ? s.depth : null;
        valueUnit.unit = s.depth ? s.depth_unit : null;
      }
      return {
        name: null,
        location_id: s.location_id,
        external_id: s.external_id,
        sensor_manufacturer_id: newManufacturer?.id,
        model: s.model,
        depth_elevation: valueUnit.value,
        depth_elevation_unit: valueUnit.unit,
      };
    });
    let insertedNewSensors = [];
    if (newSensors.length) {
      insertedNewSensors = await knex('sensor').insert(newSensors).returning('*');
    } else {
      throw Error('No sensors exist');
    }

    const newSensorReadingModes = prevSensorReadingModes.map((m) => {
      const sensor = insertedNewSensors.find((sens) => sens.location_id === m.location_id);
      const prevReadingType = readingTypes.find(
        (type) => type.partner_reading_type_id === m.partner_reading_type_id,
      );
      const newReadingType = newReadingTypes.find(
        (type) => type.type === prevReadingType.readable_value,
      );
      if (!sensor || !newReadingType) {
        throw Error('Sensor or new reading type association not found');
      }
      return {
        sensor_id: sensor.id,
        sensor_reading_type_id: newReadingType.id,
      };
    });
    await knex('sensor_reading_mode').insert(newSensorReadingModes);
  }

  await knex.schema.dropTable('sensor_reading_type_deleting');
  await knex.schema.dropTable('sensor_deleting');
  await knex.schema.dropTable('partner_reading_type');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  // WARNING: Will delete all existing sensor reading data
  await knex.schema.dropTable('sensor_reading');

  // Recreate farm_external_integration - from /20220610171713_create-farm-external-integrations-table.js
  // Including alteration from webhook address to webhook id
  await knex.schema.renameTable('farm_inbound_integration', 'farm_external_integration');
  await knex.schema.alterTable('farm_external_integration', (table) => {
    table.dropColumn('type_id');
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

  const partnerReadingTypes = await knex('partner_reading_type')
    .insert([
      {
        partner_id: 0,
        readable_value: 'soil_water_content',
      },
      {
        partner_id: 0,
        readable_value: 'soil_water_potential',
      },
      {
        partner_id: 0,
        readable_value: 'temperature',
      },
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
    ])
    .returning('*');

  // Recreate sensor table - from /20220715214935_sensor_as_standard_location.js
  // Including alteration to depth_unit
  await knex.schema.renameTable('sensor', 'sensor_deleting');
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
  });

  // Rebuild sensor reading type - from /20220715214935_sensor_as_standard_location.js
  await knex.schema.renameTable('sensor_reading_type', 'sensor_reading_type_deleting');
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

  const prevSensors = await knex('sensor_deleting').select();
  // Skip data migration - Early return mostly for api tests
  if (prevSensors.length) {
    // Recreate and migrate old sensors data format
    const manufacturers = await knex('sensor_manufacturer').select();
    const newSensors = prevSensors.map((s) => {
      const manufacturer = manufacturers.find((m) => m.id === s.sensor_manufacturer_id);
      return {
        location_id: s.location_id,
        // 0 is no itegrating partner id in the integration partner table
        partner_id: manufacturer?.integrating_partner_id ?? 0,
        external_id: s.external_id,
        model: s.model,
        depth: s.depth_elevation <= 0 && s.depth_elevation != null ? -s.depth_elevation : null,
        depth_unit: s.depth_elevation_unit ? s.depth_elevation_unit : 'cm',
        elevation: s.depth_elevation > 0 && s.depth_elevation != null ? s.depth_elevation : null,
      };
    });

    let insertedNewSensors = [];
    if (newSensors.length) {
      insertedNewSensors = await knex('sensor').insert(newSensors).returning('*');
    } else {
      throw Error('No sensors exist');
    }

    // Recreate and migrate old sensor reading modes
    const sensorModes = await knex('sensor_reading_mode').select();
    const readingTypesDeleting = await knex('sensor_reading_type_deleting').select();
    const newModes = sensorModes.map((sm) => {
      const sensor = prevSensors.find((s) => s.id === sm.sensor_id);
      const newSensor = insertedNewSensors.find((s) => s.location_id === sensor.location_id);
      const deletingType = readingTypesDeleting.find((rt) => rt.id === sm.sensor_reading_type_id);
      const partner = partnerReadingTypes.find(
        (prt) =>
          prt.partner_id === newSensor.partner_id && deletingType.type === prt.readable_value,
      );
      if (!sensor || !partner) {
        throw Error('Sensor or partner association not found');
      }
      return {
        partner_reading_type_id: partner.partner_reading_type_id,
        location_id: sensor.location_id,
      };
    });

    if (newModes.length) {
      await knex('sensor_reading_type').insert(newModes);
    } else {
      console.log('No sensor modes exist');
    }
  }

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

  // Drop unused tables
  await knex.schema.dropTable('inbound_integration_type');
  await knex.schema.dropTable('sensor_reading_mode');
  await knex.schema.dropTable('sensor_reading_type_deleting');
  await knex.schema.dropTable('sensor_deleting');
  await knex.schema.dropTable('sensor_status');
  await knex.schema.dropTable('sensor_array');
  await knex.schema.dropTable('sensor_manufacturer');
};
