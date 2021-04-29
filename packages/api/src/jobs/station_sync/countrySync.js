const { from } = require('rxjs');
const { delay, concatMap, mergeMap, catchError } = require('rxjs/operators');
const rp = require('request-promise');

const knex = require('./../../util/knex')
const endPoints = require('../../endPoints');

async function mapFarmsToCountryId() {
  const countries = await knex('countries').select('id', 'country_name');
  const farms = farmsWithNoCountryId();
  console.log(countries);
  from(farms)
    .pipe(
      mergeMap((farms) => from(farms)), // go through them 1 by 1
      concatMap((field) =>
        from(getCountryIdFromFarm(field))
          .pipe(delay(1000)),
      ),
      catchError((error) => {
        console.error(error);
      }),
    ).subscribe(async (farmData) => {
      const { farm_id, results } = farmData;
      const country = results[0].address_components.find((component) =>
        component.types.includes('country'),
      ).long_name;
      console.log(farm_id, country)
      await insertCountryIdToFarm(farm_id, country, countries);
    })
}

const farmsWithNoCountryId = async () => {
  const data = await knex.raw('SELECT farm_id, grid_points FROM farm WHERE country_id IS NULL');
  return data.rows;
}

function getCountryIdFromFarm({ farm_id, grid_points }) {
  const options = {
    uri: endPoints.googleMapsAPIGeocode,
    qs: {
      latlng: `${grid_points.lat},${grid_points.lng}`,
      key: process.env.GOOGLE_API_KEY,
    },
  }
  return rp(options).then((result) => {
    return Object.assign(JSON.parse(result), { farm_id })
  });
}


async function insertCountryIdToFarm(farm, country, countries) {
  if (country && country !== '') {
    const { id } = countries.find(c => c.country_name === country);
    await knex('farm').update({ country_id: id }).where({ farm_id: farm })
  }
}

module.exports = {
  mapFarmsToCountryId,
};
