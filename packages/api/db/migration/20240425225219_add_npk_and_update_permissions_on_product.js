/*
 *  Copyright (c) 2024 LiteFarm.org
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
  await knex.schema.alterTable('product', (table) => {
    table.decimal('n');
    table.decimal('p');
    table.decimal('k');
    table.enu('npk_unit', ['ratio', 'percent']);

    table.check(
      '(COALESCE(n, p, k) IS NULL AND npk_unit IS NULL) OR (COALESCE(n, p, k) IS NOT NULL AND npk_unit IS NOT NULL)',
      [],
      'npk_unit_check',
    );
    table.check(
      "npk_unit != 'percent' OR (npk_unit = 'percent' AND (n + p + k) <= 100)",
      [],
      'npk_percent_check',
    );
  });

  // Add missing permissions for product actions
  await knex('permissions').insert([
    {
      permission_id: 169,
      name: 'edit:product',
      description: 'edit products',
    },
    {
      permission_id: 170,
      name: 'delete:product',
      description: 'delete products',
    },
  ]);

  await knex('rolePermissions').insert([
    { role_id: 3, permission_id: 129 }, // add worker permissions to add:product
    { role_id: 1, permission_id: 169 },
    { role_id: 2, permission_id: 169 },
    { role_id: 3, permission_id: 169 },
    { role_id: 5, permission_id: 169 },
    { role_id: 1, permission_id: 170 },
    { role_id: 2, permission_id: 170 },
    { role_id: 5, permission_id: 170 },
  ]);
};

export const down = async function (knex) {
  const permissions = [169, 170];

  await knex('rolePermissions').whereIn('permission_id', permissions).del();
  await knex('permissions').whereIn('permission_id', permissions).del();

  await knex.schema.alterTable('product', (table) => {
    table.dropChecks(['npk_unit_check', 'npk_percent_check']);

    table.dropColumn('n');
    table.dropColumn('p');
    table.dropColumn('k');
    table.dropColumn('npk_unit');
  });
};
