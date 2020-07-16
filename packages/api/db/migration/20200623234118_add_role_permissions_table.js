/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (20200623234118_add_role_permissions_table.js) is part of LiteFarm.
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

exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('rolePermissions', (table) => {
      table.integer('role_id')
        .references('role_id')
        .inTable('role').onDelete('CASCADE');
      table.integer('permission_id')
        .references('permission_id')
        .inTable('permissions').onDelete('CASCADE');
      table.primary(['role_id', 'permission_id']);
    }),
  ])
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('rolePermissions'),
  ])
};
