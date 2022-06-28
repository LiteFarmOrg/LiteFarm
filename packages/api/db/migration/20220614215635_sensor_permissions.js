/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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

exports.up = async function (knex) {
  await knex('permissions').insert([
    { permission_id: 132, name: 'add:sensors', description: 'add sensors' },
    { permission_id: 133, name: 'edit:sensors', description: 'edit sensors' },
    { permission_id: 134, name: 'delete:sensors', description: 'delete sensors' },
  ]);
  await knex('rolePermissions').insert([
    { role_id: 1, permission_id: 132 },
    { role_id: 2, permission_id: 132 },
    { role_id: 5, permission_id: 132 },
    { role_id: 1, permission_id: 133 },
    { role_id: 2, permission_id: 133 },
    { role_id: 5, permission_id: 133 },
    { role_id: 1, permission_id: 134 },
    { role_id: 2, permission_id: 134 },
    { role_id: 5, permission_id: 134 },
  ]);
};

exports.down = function (knex) {
  const permissions = [132, 133, 134];
  return Promise.all([
    knex('rolePermissions').whereIn('permission_id', permissions).del(),
    knex('permissions').whereIn('permission_id', permissions).del(),
  ]);
};
