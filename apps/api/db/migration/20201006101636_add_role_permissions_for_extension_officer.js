/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (20200630153142_add_role_permissions_for_manager.js) is part of LiteFarm.
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

export const up = function (knex) {
  return Promise.all([
    knex('rolePermissions').insert([
      { role_id: 5, permission_id: 1 },
      { role_id: 5, permission_id: 2 },
      { role_id: 5, permission_id: 3 },
      { role_id: 5, permission_id: 4 },
      { role_id: 5, permission_id: 5 },
      { role_id: 5, permission_id: 6 },
      { role_id: 5, permission_id: 7 },
      { role_id: 5, permission_id: 8 },
      { role_id: 5, permission_id: 9 },
      { role_id: 5, permission_id: 10 },
      { role_id: 5, permission_id: 11 },
      { role_id: 5, permission_id: 12 },
      { role_id: 5, permission_id: 13 },
      { role_id: 5, permission_id: 14 },
      { role_id: 5, permission_id: 15 },
      { role_id: 5, permission_id: 16 },
      { role_id: 5, permission_id: 17 },
      { role_id: 5, permission_id: 18 },
      { role_id: 5, permission_id: 19 },
      { role_id: 5, permission_id: 20 },
      { role_id: 5, permission_id: 21 },
      { role_id: 5, permission_id: 22 },
      { role_id: 5, permission_id: 23 },
      { role_id: 5, permission_id: 24 },
      { role_id: 5, permission_id: 25 },
      { role_id: 5, permission_id: 26 },
      { role_id: 5, permission_id: 27 },
      { role_id: 5, permission_id: 28 },
      { role_id: 5, permission_id: 29 },
      { role_id: 5, permission_id: 30 },
      { role_id: 5, permission_id: 31 },
      { role_id: 5, permission_id: 32 },
      { role_id: 5, permission_id: 33 },
      { role_id: 5, permission_id: 34 },
      { role_id: 5, permission_id: 35 },
      { role_id: 5, permission_id: 36 },
      { role_id: 5, permission_id: 37 },
      { role_id: 5, permission_id: 38 },
      { role_id: 5, permission_id: 39 },
      { role_id: 5, permission_id: 40 },
      { role_id: 5, permission_id: 41 },
      { role_id: 5, permission_id: 42 },
      { role_id: 5, permission_id: 43 },
      { role_id: 5, permission_id: 44 },
      { role_id: 5, permission_id: 45 },
      { role_id: 5, permission_id: 46 },
      { role_id: 5, permission_id: 47 },
      { role_id: 5, permission_id: 48 },
      { role_id: 5, permission_id: 49 },
      { role_id: 5, permission_id: 50 },
      { role_id: 5, permission_id: 51 },
      { role_id: 5, permission_id: 52 },
      { role_id: 5, permission_id: 53 },
      { role_id: 5, permission_id: 54 },
      { role_id: 5, permission_id: 55 },
      { role_id: 5, permission_id: 56 },
      { role_id: 5, permission_id: 57 },
      { role_id: 5, permission_id: 58 },
      { role_id: 5, permission_id: 59 },
      { role_id: 5, permission_id: 60 },
      { role_id: 5, permission_id: 61 },
      { role_id: 5, permission_id: 62 },
      { role_id: 5, permission_id: 63 },
      { role_id: 5, permission_id: 64 },
      { role_id: 5, permission_id: 65 },
      { role_id: 5, permission_id: 66 },
      { role_id: 5, permission_id: 67 },
      { role_id: 5, permission_id: 68 },
      { role_id: 5, permission_id: 69 },
      { role_id: 5, permission_id: 70 },
      { role_id: 5, permission_id: 71 },
      { role_id: 5, permission_id: 72 },
      { role_id: 5, permission_id: 73 },
      { role_id: 5, permission_id: 74 },
      { role_id: 5, permission_id: 75 },
      { role_id: 5, permission_id: 76 },
      { role_id: 5, permission_id: 77 },
      { role_id: 5, permission_id: 78 },
      { role_id: 5, permission_id: 79 },
      { role_id: 5, permission_id: 80 },
      { role_id: 5, permission_id: 81 },
      { role_id: 5, permission_id: 82 },
      { role_id: 5, permission_id: 83 },
      { role_id: 5, permission_id: 84 },
    ]),
  ]);
};

export const down = function (knex) {
  return Promise.all([knex('rolePermissions').where('role_id', 5).del()]);
};
