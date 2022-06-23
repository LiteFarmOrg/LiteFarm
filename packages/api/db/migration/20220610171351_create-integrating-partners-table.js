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
  await knex.schema.createTable('integrating_partner', (table) => {
    table.increments('partner_id').primary();
    table.string('partner_name').notNullable();
    table.string('access_token');
    table.string('refresh_token');
    table.string('root_url');
    table.boolean('deactivated').defaultTo(false);
  });

  await knex('integrating_partner').insert([
    {
      partner_id: 1,
      partner_name: 'Ensemble Scientific',
      access_token: null,
      refresh_token: null,
      root_url: 'https://api.esci.io/',
    },
  ]);
};

exports.down = async function (knex) {
  await knex.schema.dropTable('integrating_partner');
};
