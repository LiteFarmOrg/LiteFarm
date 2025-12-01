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
  let ofnCanada = await knex('market_directory_partner').where({ key: 'OFN_CANADA' }).first();

  if (!ofnCanada) {
    [ofnCanada] = await knex('market_directory_partner')
      .insert({ key: 'OFN_CANADA' })
      .returning('*');
  }

  const canada = await knex('countries').where({ country_name: 'Canada' }).first();
  const countryRelation = await knex('market_directory_partner_country')
    .where({ market_directory_partner_id: ofnCanada.id, country_id: canada.id })
    .first();

  if (!countryRelation) {
    await knex('market_directory_partner_country').insert({
      market_directory_partner_id: ofnCanada.id,
      country_id: canada.id,
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  try {
    // Cleanup OFN_CANADA and its country relation if not in use elsewhere.
    // Foreign key constraint errors are expected and ignored.
    const canada = await knex('countries').where({ country_name: 'Canada' }).first();
    const ofnCanada = await knex('market_directory_partner').where({ key: 'OFN_CANADA' }).first();

    await knex('market_directory_partner_country')
      .where({
        market_directory_partner_id: ofnCanada.id,
        country_id: canada.id,
      })
      .del();
    await knex('market_directory_partner').where({ id: ofnCanada.id }).del();
  } catch (e) {
    // foreign_key_violation = 23503
    if (e.code === '23503') {
      console.log('Could not delete OFN_CANADA - in use by other records');
      return;
    }
    throw e;
  }
};
