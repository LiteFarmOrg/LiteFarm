/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (20230516150200_add_pin_permissions.js) is part of LiteFarm.
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

const PIN_TASK_PERMISSION_ID = 138;

export const up = function (knex) {
  return Promise.all([
    knex.schema.createTable('task_pins', (table) => {
      table.integer('task_id').references('task_id').inTable('task').primary().notNullable();
      table.dateTime('created_at').notNullable();
      table.string('created_by_user_id').references('user_id').inTable('users').notNullable();
    }),
    // Create a new permission for pinning/unpinning tasks
    knex('permissions').insert([
      { permission_id: PIN_TASK_PERMISSION_ID, name: 'pin:task', description: 'Pin/Unpin a task' },
    ]),
    // Only Farm Owners, Farm Managers and Extension Officers can pin/unpin a task
    knex('rolePermissions').insert([
      { role_id: 1, permission_id: PIN_TASK_PERMISSION_ID },
      { role_id: 2, permission_id: PIN_TASK_PERMISSION_ID },
      { role_id: 5, permission_id: PIN_TASK_PERMISSION_ID },
    ]),
  ]);
};

export const down = function (knex) {
  const permissions = [PIN_TASK_PERMISSION_ID];
  return Promise.all([
    knex('rolePermissions').whereIn('permission_id', permissions).del(),
    knex('permissions').whereIn('permission_id', permissions).del(),
    knex.schema.dropTable('task_pins'),
  ]);
};
