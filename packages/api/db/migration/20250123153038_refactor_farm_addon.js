/*
 *  Copyright (c) 2025 LiteFarm.org
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
  await knex.schema.renameTable('integrating_partner', 'addon');
  await knex.schema.alterTable('addon', (t) => {
    t.renameColumn('partner_id', 'id');
    t.renameColumn('partner_name', 'name');
  });

  await knex.schema.renameTable('farm_external_integration', 'farm_addon');
  await knex.schema.alterTable('farm_addon', (t) => {
    t.renameColumn('partner_id', 'addon_id');
    t.renameColumn('organization_uuid', 'org_uuid');
    t.dropColumn('webhook_id');
    t.integer('org_pk').nullable();
  });

  await knex('permissions').insert([
    { permission_id: 172, name: 'get:sensors', description: 'get sensors' },
    { permission_id: 173, name: 'get:farm_addon', description: 'get farm_addons' },
    { permission_id: 174, name: 'add:farm_addon', description: 'add farm_addons' },
    { permission_id: 175, name: 'edit:farm_addon', description: 'edit farm_addons' },
    { permission_id: 176, name: 'delete:farm_addon', description: 'delete farm_addons' },
  ]);

  // Farm workers CAN get sensors
  // Farm workers CANNOT get, add, edit, delete farm_addons
  await knex('rolePermissions').insert([
    { role_id: 1, permission_id: 172 },
    { role_id: 2, permission_id: 172 },
    { role_id: 3, permission_id: 172 },
    { role_id: 5, permission_id: 172 },
    { role_id: 1, permission_id: 173 },
    { role_id: 2, permission_id: 173 },
    { role_id: 5, permission_id: 173 },
    { role_id: 1, permission_id: 174 },
    { role_id: 2, permission_id: 174 },
    { role_id: 5, permission_id: 174 },
    { role_id: 1, permission_id: 175 },
    { role_id: 2, permission_id: 175 },
    { role_id: 5, permission_id: 175 },
    { role_id: 1, permission_id: 176 },
    { role_id: 2, permission_id: 176 },
    { role_id: 5, permission_id: 176 },
  ]);
};

export const down = async function (knex) {
  await knex.schema.renameTable('addon', 'integrating_partner');
  await knex.schema.alterTable('integrating_partner', (t) => {
    t.renameColumn('id', 'partner_id');
    t.renameColumn('name', 'partner_name');
  });

  await knex.schema.renameTable('farm_addon', 'farm_external_integration');
  await knex.schema.alterTable('farm_external_integration', (t) => {
    t.renameColumn('addon_id', 'partner_id');
    t.renameColumn('org_uuid', 'organization_uuid');
    t.dropColumn('org_pk');
    t.integer('webhook_id').nullable();
  });
  await knex('rolePermissions').whereIn('permission_id', [172, 173, 174, 175, 176]).del();
  await knex('permissions').whereIn('permission_id', [172, 173, 174, 175, 176]).del();
};
