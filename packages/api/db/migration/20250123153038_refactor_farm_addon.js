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
};
