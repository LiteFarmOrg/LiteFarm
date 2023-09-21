/*
 *  Copyright 2023 LiteFarm.org
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
  const GuernseyExists = await knex('countries').select('*').where('country_code', 'GG').first();
  const AlandExists = await knex('countries').select('*').where('country_code', 'AX').first();
  if (!GuernseyExists) {
    await knex('countries').insert([
      {
        country_name: 'Guernsey',
        currency: 'British pound',
        symbol: '£',
        iso: 'GBP',
        unit: 'Metric',
        country_code: 'GG',
      },
    ]);
  }
  if (!AlandExists) {
    await knex('countries').insert([
      {
        country_name: 'Åland Islands',
        currency: 'Euro',
        symbol: '€',
        iso: 'EUR',
        unit: 'Metric',
        country_code: 'AX',
      },
    ]);
  }
};

export const down = async function () {
  // No down function since it may exist prior
};
