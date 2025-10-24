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
  await knex('permissions').insert([
    {
      permission_id: 179,
      name: 'add:market_directory_info',
      description: 'add market_directory_info',
    },
    {
      permission_id: 180,
      name: 'edit:market_directory_info',
      description: 'edit market_directory_info',
    },
    {
      permission_id: 181,
      name: 'delete:market_directory_info',
      description: 'delete market_directory_info',
    },
  ]);
  await knex('rolePermissions').insert([
    { role_id: 1, permission_id: 179 },
    { role_id: 2, permission_id: 179 },
    { role_id: 5, permission_id: 179 },
    { role_id: 1, permission_id: 180 },
    { role_id: 2, permission_id: 180 },
    { role_id: 5, permission_id: 180 },
    { role_id: 1, permission_id: 181 },
    { role_id: 2, permission_id: 181 },
    { role_id: 5, permission_id: 181 },
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function (knex) {
  const permissions = [179, 180, 181];
  return Promise.all([
    knex('rolePermissions').whereIn('permission_id', permissions).del(),
    knex('permissions').whereIn('permission_id', permissions).del(),
  ]);
};
