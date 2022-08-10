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

export const up = async function (knex) {
  await knex.schema.createTable('farm_external_integration', (table) => {
    table.primary(['farm_id', 'partner_id']);
    table.uuid('farm_id').references('farm_id').inTable('farm');
    table.integer('partner_id').references('partner_id').inTable('integrating_partner');
    table.uuid('organization_uuid');
    table.string('webhook_address');
  });
};

export const down = async function (knex) {
  await knex.schema.dropTable('farm_external_integration');
};
