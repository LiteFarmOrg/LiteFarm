/*
 *  Copyright 2025 LiteFarm.org
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

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  const canada = await knex('countries').where({ country_name: 'Canada' }).first();

  const [ofnCanada] = await knex('market_directory_partner')
    .insert({ key: 'OFN_CANADA' })
    .returning('*');

  await knex('market_directory_partner_country').insert({
    market_directory_partner_id: ofnCanada.id,
    country_id: canada.id,
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  const ofnCanada = await knex('market_directory_partner').where({ key: 'OFN_CANADA' }).first();

  await knex('market_directory_partner_country')
    .where({
      market_directory_partner_id: ofnCanada.id,
    })
    .del();
  await knex('market_directory_partner').where('id', ofnCanada.id).del();
};
