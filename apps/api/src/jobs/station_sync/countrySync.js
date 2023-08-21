import { from } from 'rxjs';
import { delay, concatMap, catchError, finalize } from 'rxjs/operators/index.js';
import rp from 'request-promise';
import endPoints from '../../endPoints.js';

async function mapFarmsToCountryId(knex) {
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
        let country;
        results.find((place) =>
          place?.address_components?.find((component) => {
            if (component?.types?.includes?.('country')) {
              country = component.long_name;
              return true;
            }
            return false;
          }),
        );
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
    const lookup = countries.find((c) => c.country_name === country);
    if (lookup?.id) {
      await knex('farm').update({ country_id: lookup.id }).where({ farm_id: farm });
    } else {
      console.log(`Found no country matching '${country}'; farm_id ${farm}`);
    }
  } else {
    console.log(`Found no country for farm_id ${farm}`);
  }
}

export { mapFarmsToCountryId };
