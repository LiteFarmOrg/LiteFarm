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

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable('soil_sample_location', (table) => {
    table
      .uuid('location_id')
      .primary()
      .references('location_id')
      .inTable('location')
      .onDelete('CASCADE');
  });

  await knex.raw(
    formatAlterTableEnumSql('figure', 'type', [
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
    ]),
  );

  await knex('permissions').insert([
    {
      permission_id: 177,
      name: 'add:soil_sample_location',
      description: 'Create a soil sample location',
    },
    {
      permission_id: 178,
      name: 'edit:soil_sample_location',
      description: 'Edit a soil sample location',
    },
  ]);

  await knex('rolePermissions').insert([
    { role_id: 1, permission_id: 177 },
    { role_id: 2, permission_id: 177 },
    { role_id: 5, permission_id: 177 },
    { role_id: 1, permission_id: 178 },
    { role_id: 2, permission_id: 178 },
    { role_id: 5, permission_id: 178 },
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const down = async function (knex) {
  const permissions = [177, 178];

  await knex('rolePermissions').whereIn('permission_id', permissions).del();

  await knex('permissions').whereIn('permission_id', permissions).del();

  await knex.raw(
    formatAlterTableEnumSql('figure', 'type', [
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
    ]),
  );

  await knex.schema.dropTable('soil_sample_location');
};
