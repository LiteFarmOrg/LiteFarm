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

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const up = async function (knex) {
  await knex.schema.alterTable('irrigation_task', (table) => {
    table.integer('irrigation_prescription_external_id');
  });

  // Rename get:sensors (only used in sensors v2) to get:smart_irrigation
  await knex('permissions').where({ permission_id: 172 }).update({
    name: 'get:smart_irrigation',
    description: 'get smart irrigation',
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const down = async function (knex) {
  // Restore get:sensors permissions name
  await knex('permissions').where({ permission_id: 172 }).update({
    name: 'get:sensors',
    description: 'get sensors',
  });

  await knex.schema.alterTable('irrigation_task', (table) => {
    table.dropColumn('irrigation_prescription_external_id');
  });
};
