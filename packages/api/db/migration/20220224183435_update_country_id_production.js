import { mapFarmsToCountryId } from '../../src/jobs/station_sync/countrySync.js';

export const up = function (knex) {
  if (['integration', 'production'].includes(process.env.NODE_ENV)) {
    return mapFarmsToCountryId(knex);
  }
};

export const down = function () {};
