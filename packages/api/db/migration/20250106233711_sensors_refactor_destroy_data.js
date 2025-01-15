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

  // Add inbound integration type
  await knex.schema.createTable('inbound_integration_type', (table) => {
    table.increments('id').primary();
    table.string('type').notNullable();
  });

  await knex('inbound_integration_type').insert([
    { type: 'SENSOR_READING' },
    { type: 'IRRIGATION_PRESCRIPTION' },
  ]);

  const sensorIntegrationType = await knex('inbound_integration_type')
    .select()
    .where('type', '=', 'SENSOR_READING')
    .first();

  // Create farm inbound integration
  await knex.schema.renameTable('farm_external_integration', 'farm_inbound_integration');
  await knex.schema.alterTable('farm_inbound_integration', (table) => {
    table
      .integer('type_id')
      .references('id')
      .inTable('inbound_integration_type')
      .notNullable()
      .defaultTo(sensorIntegrationType.id);
  });
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
    // Would duplicate name on integrating_partner if integrating_partner_id exists
    table.string('name').notNullable();
    // Assuming we will be using null values to indicate defaults
    table.uuid('farm_id').references('farm_id').inTable('farm').nullable();
    table
      .integer('integrating_partner_id')
      .references('partner_id')
      .inTable('integrating_partner')
      .nullable();
  });

  // Create sensor_array table
  await knex.schema.createTable('sensor_array', (table) => {
    // Other locations seem to use .onDelete('CASCADE') but I don't think it is appropriate here
    table.uuid('location_id').primary().references('location_id').inTable('location').notNullable();
    // Cannot be required as old data does not have it
    table.uuid('field_location_id').references('location_id').inTable('field').nullable();
  });

  // Add inbound integration type
  await knex.schema.createTable('sensor_status', (table) => {
    table.increments('id').primary();
    table.string('key').notNullable();
  });

  await knex('sensor_status').insert([{ key: 'ONLINE' }, { key: 'OFFLINE' }]);

  // Create sensor table
  await knex.schema.renameTable('sensor', 'sensor_deleting');
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
    // New way to check both null or both not null
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

  const integratingPartners = await knex('integrating_partner').select();
  const farmInboundIntegrations = await knex('farm_inbound_integration').select();
  const sensors = await knex('sensor_deleting').select();
  const sensorReadingModes = await knex('sensor_reading_type_deleting').select();
  const readingTypes = await knex('partner_reading_type').select();

  // map integrating partner to sensor_manufacturer
  const newManufacturers = farmInboundIntegrations.reduce((acc, cv) => {
    const partner = integratingPartners.find((part) => part.partner_id === cv.partner_id);
    if (!partner) {
      throw Error('Partner association not found');
    }
    const manufacturer = {
      name: partner.partner_name,
      farm_id: cv.farm_id,
      integrating_partner_id: cv.partner_id,
    };
    acc.push(manufacturer);
    return acc;
  }, []);

  const insertedManufacturers = await knex('sensor_manufacturer')
    .insert(newManufacturers)
    .returning('*');

  // all existing sensors assumed to be an array of 1, user can re-configure as needed
  const sensorLocationIds = [];
  const newArrays = sensors.reduce((acc, cv) => {
    const array = {
      location_id: cv.location_id,
    };
    sensorLocationIds.push(cv.location_id);
    acc.push(array);
    return acc;
  }, []);
  await knex('sensor_array').insert(newArrays);
  const sensorLocations = await knex('location').select().whereIn('location_id', sensorLocationIds);

  const newSensors = sensors.reduce((acc, cv) => {
    const location = sensorLocations.find((loc) => loc.location_id === cv.location_id);
    if (!location) {
      throw Error('Location association not found');
    }
    const newManufacturer = insertedManufacturers.find((man) => man.farm_id === location.farm_id);
    const valueUnit = {};
    if (cv.depth > 0) {
      valueUnit.value = -cv.depth;
      valueUnit.unit = cv.depth_unit;
    } else if (cv.elevation > 0) {
      valueUnit.value = cv.elevation;
      valueUnit.unit = cv.depth_unit;
    } else {
      valueUnit.value = cv.depth ? cv.depth : null;
      valueUnit.unit = cv.depth ? cv.depth_unit : null;
    }
    const sensor = {
      name: null,
      location_id: cv.location_id,
      external_id: cv.external_id,
      sensor_manufacturer_id: newManufacturer?.id,
      model: cv.model,
      depth_elevation: valueUnit.value,
      depth_elevation_unit: valueUnit.unit,
    };
    acc.push(sensor);
    return acc;
  }, []);

  const insertedNewSensors = await knex('sensor').insert(newSensors).returning('*');

  const newModes = sensorReadingModes.reduce((acc, cv) => {
    const sensor = insertedNewSensors.find((sens) => sens.location_id === cv.location_id);
    const prevReadingType = readingTypes.find(
      (type) => type.partner_reading_type_id === cv.partner_reading_type_id,
    );
    const newReadingType = newReadingTypes.find(
      (type) => type.type === prevReadingType.readable_value,
    );
    if (!sensor || !newReadingType) {
      throw Error('Sensor or new reading type association not found');
    }
    const mode = {
      sensor_id: sensor.id,
      sensor_reading_type_id: newReadingType.id,
    };
    acc.push(mode);
    return acc;
  }, []);
  await knex('sensor_reading_mode').insert(newModes);

  await knex.schema.dropTable('sensor_reading_type_deleting');
  await knex.schema.dropTable('sensor_deleting');
  await knex.schema.dropTable('partner_reading_type');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  // WARNING: Will delete all existing sensor readinf data
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
  const manufacturers = await knex('sensor_manufacturer').select();
  const sensors = await knex('sensor_deleting').select();
  const newSensors = sensors.reduce((acc, cv) => {
    const manufacturer = manufacturers.find((man) => man.id === cv.sensor_manufacturer_id);
    const sensor = {
      location_id: cv.location_id,
      // 0 is no itegrating partner id in the integration partner table
      partner_id: manufacturer?.integrating_partner_id ?? 0,
      external_id: cv.external_id,
      model: cv.model,
      depth: cv.depth_elevation <= 0 ? -cv.depth_elevation : null,
      depth_unit: cv.depth_elevation_unit,
      elevation: cv.depth_elevation > 0 ? cv.depth_elevation : null,
    };
    acc.push(sensor);
    return acc;
  }, []);
  const insertedNewSensors = await knex('sensor').insert(newSensors).returning('*');
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
  const sensorModes = await knex('sensor_reading_mode').select();
  const readingTypesDeleting = await knex('sensor_reading_type_deleting').select();
  const newModes = sensorModes.reduce((acc, cv) => {
    const sensor = sensors.find((sens) => sens.id === cv.sensor_id);
    const newSensor = insertedNewSensors.find((sens) => sens.location_id === sensor.location_id);
    const deletingType = readingTypesDeleting.find((type) => type.id === cv.sensor_reading_type_id);
    const partner = partnerReadingTypes.find(
      (partner) =>
        partner.partner_id === newSensor.partner_id && deletingType.type === partner.readable_value,
    );
    if (!sensor || !partner) {
      throw Error('Sensor or partner association not found');
    }
    const mode = {
      partner_reading_type_id: partner.partner_reading_type_id,
      location_id: sensor.location_id,
    };
    acc.push(mode);
    return acc;
  }, []);
  await knex('sensor_reading_type').insert(newModes);
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

  await knex.schema.dropTable('inbound_integration_type');
  await knex.schema.dropTable('sensor_reading_mode');
  await knex.schema.dropTable('sensor_reading_type_deleting');
  await knex.schema.dropTable('sensor_deleting');
  await knex.schema.dropTable('sensor_status');
  await knex.schema.dropTable('sensor_array');
  await knex.schema.dropTable('sensor_manufacturer');
};
