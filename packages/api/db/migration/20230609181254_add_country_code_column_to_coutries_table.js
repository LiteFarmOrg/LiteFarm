/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
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
import countryIsoCodes from '../seeds/seedData/country_iso_codes.json' assert { type: 'json' };

export const up = function (knex) {
  return knex.transaction((trx) => {
    // Update schema of the table
    return knex.schema
      .alterTable('countries', function (t) {
        t.string('country_code', 2);
      })
      .then(() => {
        // read the data from conutries table to update
        return knex.select().from('countries');
      })
      .then((countries) => {
        // read iso codes from file and update database
        return Promise.all(
          countries.map((country) => {
            const countryCode = countryIsoCodes.find((ctry) => ctry.name === country.country_name);
            if (countryCode) {
              return knex('countries')
                .update({ country_code: countryCode['alpha-2'] })
                .where('id', country.id)
                .transacting(trx);
            }
          }),
        );
      })
      .then(() => {
        // Make the columns not nullable.
        return knex.schema.alterTable('countries', function (t) {
          t.string('country_code', 2).notNullable().alter();
        });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  });
};

export const down = function (knex) {
  return knex.schema.alterTable('countries', function (t) {
    t.dropColumn('country_code');
  });
};
