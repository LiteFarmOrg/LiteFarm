/*
 *  Copyright (c) 2023 LiteFarm.org
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

export const up = async function (knex) {
  await knex.schema.createTable('finance_report', (table) => {
    table.increments('finance_report_id').primary();
    table.uuid('farm_id').references('farm_id').inTable('farm').notNullable();
    table.string('created_by_user_id').references('user_id').inTable('users');
    table.string('updated_by_user_id').references('user_id').inTable('users');
    table.dateTime('created_at').notNullable();
    table.dateTime('updated_at').notNullable();
    table.string('file_type').notNullable();
    table.jsonb('filter_config');
  });

  await knex('permissions').insert([
    { permission_id: 142, name: 'add:finance_report', description: 'Generate a finance report' },
  ]);

  await knex('rolePermissions').insert([
    { role_id: 1, permission_id: 142 },
    { role_id: 2, permission_id: 142 },
    { role_id: 5, permission_id: 142 },
  ]);
};

export const down = async function (knex) {
  const permissions = [142];

  await knex('rolePermissions').whereIn('permission_id', permissions).del();
  await knex('permissions').whereIn('permission_id', permissions).del();

  await knex.schema.dropTable('finance_report');
};
