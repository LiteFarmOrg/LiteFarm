/*
 *  Copyright 2026 LiteFarm.org
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
  return knex.schema.createTable('offline_event_log', function (table) {
    table.increments('id').primary();
    table.uuid('session_id').notNullable();
    table.string('event_name').notNullable();
    table.integer('status_code');
    table.string('url');
    table.integer('country_id').references('id').inTable('countries');
    table.string('network');
    table.string('browser');
    table.string('browser_version');
    table.string('device_vendor');
    table.string('os');
    table.string('device_model');
    table.string('app_version');
    table.string('log_status');
    table.dateTime('event_at').notNullable();
    table.dateTime('went_online_at');
    table.unique(['session_id', 'event_name', 'event_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  return knex.schema.dropTable('offline_event_log');
};
