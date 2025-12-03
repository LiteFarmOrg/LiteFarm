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
  await knex.schema.createTable('pasture', (table) => {
    table
      .uuid('location_id')
      .primary()
      .references('location_id')
      .inTable('location')
      .onDelete('CASCADE');
    table
      .enu('organic_status', ['Non-Organic', 'Transitional', 'Organic'])
      .defaultTo('Non-Organic');
    table.date('transition_date');
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
      'pasture',
    ]),
  );

  await knex('permissions').insert([
    {
      permission_id: 185,
      name: 'add:pastures',
      description: 'add pastures',
    },
    {
      permission_id: 186,
      name: 'get:pastures',
      description: 'get pastures',
    },
    {
      permission_id: 187,
      name: 'edit:pastures',
      description: 'edit pastures',
    },
    {
      permission_id: 188,
      name: 'delete:pastures',
      description: 'delete pastures',
    },
  ]);
  await knex('rolePermissions').insert([
    { role_id: 1, permission_id: 185 },
    { role_id: 2, permission_id: 185 },
    { role_id: 5, permission_id: 185 },
    { role_id: 1, permission_id: 186 },
    { role_id: 2, permission_id: 186 },
    { role_id: 3, permission_id: 186 }, // workers can get
    { role_id: 5, permission_id: 186 },
    { role_id: 1, permission_id: 187 },
    { role_id: 2, permission_id: 187 },
    { role_id: 5, permission_id: 187 },
    { role_id: 1, permission_id: 188 },
    { role_id: 2, permission_id: 188 },
    { role_id: 5, permission_id: 188 },
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  const permissions = [185, 186, 187, 188];
  Promise.all([
    knex('rolePermissions').whereIn('permission_id', permissions).del(),
    knex('permissions').whereIn('permission_id', permissions).del(),
  ]);

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

  await knex.schema.dropTable('pasture');
};
