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
      permission_id: 184,
      name: 'get:market_directory_partner',
      description: 'get market_directory_partner',
    },
  ]);
  await knex('rolePermissions').insert([
    { role_id: 1, permission_id: 184 },
    { role_id: 2, permission_id: 184 },
    { role_id: 3, permission_id: 184 },
    { role_id: 5, permission_id: 184 },
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function (knex) {
  const permissionId = 184;
  return Promise.all([
    knex('rolePermissions').where('permission_id', permissionId).del(),
    knex('permissions').where('permission_id', permissionId).del(),
  ]);
};
