/*
 *  Copyright 2025 LiteFarm.org
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

import { formatAlterTableEnumSql } from '../util.js';

const existingFigureTypes = [
  'field',
  'farm_site_boundary',
  'greenhouse',
  'buffer_zone',
  'gate',
  'surface_water',
  'fence',
  'garden',
  'residence',
  'water_valve',
  'watercourse',
  'barn',
  'natural_area',
  'ceremonial_area',
  'pin',
  'sensor',
  'soil_sample_location',
];

const sensorRelatedTaskTypeTables = [
  'soil_amendment_task',
  'pest_control_task',
  'field_work_task',
  'cleaning_task',
];

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  // location
  // {
  //   sensor: {},
  //   figure: { point: {} },
  //   sensor_readings: [{}],
  //   sensor_reading_types: [{ partner_reading_type: {} }],
  //   tasks: [{}]
  // };

  // Rows to be inserted to 'migration_deletion_logs' table
  // When rolling back, rows will be restored backwards
  const rowsToLog = [];
  const addToLogs = (rows, tableName) => {
    rows.forEach((row) => {
      rowsToLog.push({ table_name: tableName, data: row });
    });
  };

  const figureIdsOfSensors = [];
  const locationIdsOfSensors = [];

  const sensorFigures = await knex('figure').where('type', 'sensor');

  sensorFigures.forEach(({ figure_id, location_id }) => {
    figureIdsOfSensors.push(figure_id);
    locationIdsOfSensors.push(location_id);
  });

  const taskSensorRelations = await knex('location_tasks').whereIn(
    'location_id',
    locationIdsOfSensors,
  );
  addToLogs(taskSensorRelations, 'location_tasks');

  const sensorTaskIds = taskSensorRelations.map(({ task_id }) => task_id);

  const soilAmendmentTaskProductsToDelete = await knex('soil_amendment_task_products').whereIn(
    'task_id',
    sensorTaskIds,
  );
  const productsPurposeRelationshipsToDelete = await knex(
    'soil_amendment_task_products_purpose_relationship',
  ).whereIn(
    'task_products_id',
    soilAmendmentTaskProductsToDelete.map(({ id }) => id),
  );
  addToLogs(
    productsPurposeRelationshipsToDelete,
    'soil_amendment_task_products_purpose_relationship',
  );
  addToLogs(soilAmendmentTaskProductsToDelete, 'soil_amendment_task_products');

  const subTasksToDelete = {};

  for (const tableName of sensorRelatedTaskTypeTables) {
    const subTaskRows = await knex(tableName).whereIn('task_id', sensorTaskIds);

    if (subTaskRows.length) {
      subTasksToDelete[tableName] = subTaskRows.map(({ task_id }) => task_id);
      addToLogs(subTaskRows, tableName);
    }
  }

  const sensorTasks = await knex('task').whereIn('task_id', sensorTaskIds);
  addToLogs(sensorTasks, 'task');

  const sensorPoints = await knex('point').whereIn('figure_id', figureIdsOfSensors);
  addToLogs(sensorPoints, 'point');

  addToLogs(sensorFigures, 'figure');

  const sensorReadingTypes = await knex('sensor_reading_type');
  addToLogs(sensorReadingTypes, 'sensor_reading_type');

  const partnerReadingTypes = await knex('partner_reading_type');
  addToLogs(partnerReadingTypes, 'partner_reading_type');

  const sensors = await knex('sensor');
  addToLogs(sensors, 'sensor');

  const sensorLocations = await knex('location').whereIn('location_id', locationIdsOfSensors);
  addToLogs(sensorLocations, 'location');

  await knex('location_tasks').whereIn('location_id', locationIdsOfSensors).del();

  await knex('soil_amendment_task_products_purpose_relationship')
    .whereIn(
      'task_products_id',
      soilAmendmentTaskProductsToDelete.map(({ id }) => id),
    )
    .del();
  await knex('soil_amendment_task_products').whereIn('task_id', sensorTaskIds).del();

  for (const [tableName, ids] of Object.entries(subTasksToDelete)) {
    await knex(tableName).whereIn('task_id', ids).del();
  }

  await knex('task').whereIn('task_id', sensorTaskIds).del();

  await knex('point').whereIn('figure_id', figureIdsOfSensors).del();
  await knex('figure').whereIn('figure_id', figureIdsOfSensors).del();

  // Remove "sensor" from the "type" enum in the figure table
  await knex.raw(
    formatAlterTableEnumSql(
      'figure',
      'type',
      existingFigureTypes.filter((type) => type !== 'sensor'),
    ),
  );

  await knex.schema.dropTable('sensor_reading_type');
  await knex.schema.dropTable('sensor_reading');
  await knex.schema.dropTable('sensor');
  await knex.schema.dropTable('partner_reading_type');
  await knex('location').whereIn('location_id', locationIdsOfSensors).del();

  // Remove the sensor_reading_chart column from showedSpotlight table
  await knex.schema.alterTable('showedSpotlight', (table) => {
    table.dropColumn('sensor_reading_chart');
    table.dropColumn('sensor_reading_chart_end');
  });

  await knex.schema.createTable('migration_deletion_logs', function (table) {
    table.increments('id').primary();
    table.string('migration_name').notNullable();
    table.string('table_name').notNullable();
    table.jsonb('data').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
  });

  await knex('migration_deletion_logs').insert(
    rowsToLog.map((row) => ({ migration_name: 'cleanup_previous_sensors_implementation', ...row })),
  );

  // Remove notifications for sensors
  const sensorNotifications = await knex('notification').whereRaw(
    `context->>'icon_translation_key' = 'SENSOR'`,
  );
  const notificationIdsToRemove = sensorNotifications.map(({ notification_id }) => notification_id);
  await knex('notification_user').whereIn('notification_id', notificationIdsToRemove).del();
  await knex('notification').whereIn('notification_id', notificationIdsToRemove).del();
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  // Copied from 20220614195741_sensor_reading_types.js
  // NOTE: integrating_partner table was renamed to 'addon_partner' (20250123153038_refactor_farm_addon.js)
  await knex.schema.createTable('partner_reading_type', function (table) {
    table
      .uuid('partner_reading_type_id')
      .primary()
      .notNullable()
      .defaultTo(knex.raw('uuid_generate_v1()'));
    table.integer('partner_id').references('id').inTable('addon_partner').notNullable();
    table.integer('raw_value');
    table.string('readable_value');
  });

  // Copied from 20220715214935_sensor_as_standard_location.js and 20220802170808_add_depth_unit_to_sensor_table.js
  await knex.schema.createTable('sensor', function (table) {
    table
      .uuid('location_id')
      .primary()
      .notNullable()
      .references('location_id')
      .inTable('location')
      .unique()
      .onDelete('CASCADE');
    table.integer('partner_id').references('id').inTable('addon_partner').notNullable();
    table.string('external_id').notNullable();
    table.float('depth');
    table.enu('depth_unit', ['cm', 'm', 'in', 'ft']).defaultTo('cm');
    table.float('elevation');
    table.string('model');
  });

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

  await knex.schema.alterTable('showedSpotlight', (t) => {
    t.boolean('sensor_reading_chart').defaultTo(false);
    t.timestamp('sensor_reading_chart_end').nullable().defaultTo(null);
  });

  await knex.raw(formatAlterTableEnumSql('figure', 'type', existingFigureTypes));

  // Restore deleted rows from migration_deletion_logs
  const rows = await knex('migration_deletion_logs')
    .where('migration_name', 'cleanup_previous_sensors_implementation')
    .orderBy('id', 'desc');

  for (const { table_name, data } of rows) {
    try {
      await knex(table_name).insert(data);
    } catch (err) {
      console.error(`Failed to restore row in ${table_name}:`, err);
      throw err;
    }
  }

  await knex.schema.dropTable('migration_deletion_logs');
};
