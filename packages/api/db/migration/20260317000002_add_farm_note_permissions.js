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
  await knex('permissions').insert([
    { permission_id: 188, name: 'get:farm_notes', description: 'get farm_notes' },
    { permission_id: 189, name: 'add:farm_notes', description: 'add farm_notes' },
    { permission_id: 190, name: 'edit:farm_notes', description: 'edit farm_notes' },
    { permission_id: 191, name: 'delete:farm_notes', description: 'delete farm_notes' },
  ]);
  await knex('rolePermissions').insert([
    { role_id: 1, permission_id: 188 },
    { role_id: 2, permission_id: 188 },
    { role_id: 3, permission_id: 188 },
    { role_id: 5, permission_id: 188 },
    { role_id: 1, permission_id: 189 },
    { role_id: 2, permission_id: 189 },
    { role_id: 3, permission_id: 189 },
    { role_id: 5, permission_id: 189 },
    { role_id: 1, permission_id: 190 },
    { role_id: 2, permission_id: 190 },
    { role_id: 3, permission_id: 190 },
    { role_id: 5, permission_id: 190 },
    { role_id: 1, permission_id: 191 },
    { role_id: 2, permission_id: 191 },
    { role_id: 3, permission_id: 191 },
    { role_id: 5, permission_id: 191 },
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  const permissions = [188, 189, 190, 191];
  await knex('rolePermissions').whereIn('permission_id', permissions).del();
  await knex('permissions').whereIn('permission_id', permissions).del();
};
