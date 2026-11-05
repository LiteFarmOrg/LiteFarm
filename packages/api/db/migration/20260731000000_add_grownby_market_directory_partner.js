/*
 *  Copyright 2026 LiteFarm.org
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

const GROWNBY_COUNTRIES = ['United States', 'Canada'];

/**
 * Registers GrownBy (https://grownby.com) as a market-directory partner,
 * alongside OFN. Mirrors 20251126175424_add_market_directory_partner.js.
 *
 * GrownBy operates in the United States and Canada, so it is linked to both
 * countries; farms in either will see the GrownBy tile.
 *
 *
 * MANUAL STEP REQUIRED PER ENVIRONMENT. This migration does not insert the
 * `market_directory_partner_auth` row. The values for this record differ per
 * environment, so insert the row by hand against each database. The OFN
 * auth row is maintained the same way.
 *
 * Until the auth row exists the tile renders and the Share toggle saves, but
 * nothing else happens: notifyMarketDirectoryPartners.ts finds no row and sends
 * no webhook, and checkMarketPartnerAuth.ts rejects GrownBy's own requests with
 * 404 `client_id not recognized`.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  let grownby = await knex('market_directory_partner').where({ key: 'GROWNBY' }).first();

  if (!grownby) {
    [grownby] = await knex('market_directory_partner').insert({ key: 'GROWNBY' }).returning('*');
  }

  for (const countryName of GROWNBY_COUNTRIES) {
    const country = await knex('countries').where({ country_name: countryName }).first();
    if (!country) {
      continue;
    }

    const countryRelation = await knex('market_directory_partner_country')
      .where({ market_directory_partner_id: grownby.id, country_id: country.id })
      .first();

    if (!countryRelation) {
      await knex('market_directory_partner_country').insert({
        market_directory_partner_id: grownby.id,
        country_id: country.id,
      });
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  try {
    // Cleanup GROWNBY and its country relations if not in use elsewhere.
    // Foreign key constraint errors are expected and ignored.
    const grownby = await knex('market_directory_partner').where({ key: 'GROWNBY' }).first();
    if (!grownby) {
      return;
    }

    for (const countryName of GROWNBY_COUNTRIES) {
      const country = await knex('countries').where({ country_name: countryName }).first();
      if (!country) {
        continue;
      }

      await knex('market_directory_partner_country')
        .where({ market_directory_partner_id: grownby.id, country_id: country.id })
        .del();
    }

    await knex('market_directory_partner').where({ id: grownby.id }).del();
  } catch (e) {
    // foreign_key_violation = 23503
    if (e.code === '23503') {
      console.log('Could not delete GROWNBY - in use by other records');
      return;
    }
    throw e;
  }
};
