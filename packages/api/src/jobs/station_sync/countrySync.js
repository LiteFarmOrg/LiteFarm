const { from } = require('rxjs');
const { delay, concatMap, catchError, finalize } = require('rxjs/operators');
const rp = require('request-promise');

const knex = require('./../../util/knex');
const endPoints = require('../../endPoints');

async function mapFarmsToCountryId(knex = knex) {
  const countries = await knex('countries').select('id', 'country_name');
  const farms = await farmsWithNoCountryId(knex);
  return new Promise((resolve) => {
    from(farms)
      .pipe(
        concatMap((field) => from(getCountryIdFromFarm(field)).pipe(delay(1000))),
        catchError((error) => {
          console.error(error);
        }),
        finalize(() => resolve()),
      )
      .subscribe(async (farmData) => {
        const { farm_id, results } = farmData;
        const country = results[0].address_components.find((component) =>
          component.types.includes('country'),
        )?.long_name;
        country && (await insertCountryIdToFarm(knex, farm_id, country, countries));
      });
  });
}

const farmsWithNoCountryId = async (knex) => {
  const data = await knex.raw(
    'SELECT farm_id, grid_points FROM farm WHERE country_id IS NULL AND grid_points IS NOT NULL',
  );
  return data.rows;
};

function getCountryIdFromFarm({ farm_id, grid_points }) {
  const options = {
    uri: endPoints.googleMapsAPIGeocode,
    qs: {
      latlng: `${grid_points.lat},${grid_points.lng}`,
      key: process.env.GOOGLE_API_KEY,
    },
  };
  return rp(options).then((result) => {
    return Object.assign(JSON.parse(result), { farm_id });
  });
}

async function insertCountryIdToFarm(knex, farm, country, countries) {
  if (country && country !== '') {
    const { id } = countries.find((c) => c.country_name === country);
    await knex('farm').update({ country_id: id }).where({ farm_id: farm });
  }
}

module.exports = {
  mapFarmsToCountryId,
};
