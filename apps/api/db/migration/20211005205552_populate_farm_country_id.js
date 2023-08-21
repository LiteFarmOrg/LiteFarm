import { mapFarmsToCountryId } from '../../src/jobs/station_sync/countrySync.js';

export const up = function (knex) {
  if (['production', 'integration'].includes(process.env.NODE_ENV)) {
    return mapFarmsToCountryId(knex);
  }
};

// eslint-disable-next-line no-unused-vars
export const down = function (knex) {};
