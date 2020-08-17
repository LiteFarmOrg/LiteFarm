const { from } = require('rxjs');
const { delay, concatMap, mergeMap, catchError } = require('rxjs/operators');
const rp = require('request-promise');

const Knex = require('knex');
const environment = process.env.NODE_ENV || 'development';
const config = require('../../../knexfile')[environment];
const knex = Knex(config);
const endPoints = require('../../endPoints');
const { OPEN_WEATHER_APP_ID } = require('../../credentials');

function mapFieldsToStationId(fieldsToSet) {
  const fields = Promise.resolve(fieldsToSet) || fieldsWithNoStationId();
  from(fields)
    .pipe(
      mergeMap((fields) => from(fields)),
      concatMap((field) =>
        from(getStationIdFromField(field))
          .pipe(delay(1000))
      ),
      catchError((error) => {
        console.error(error)
      })
    ).subscribe(async (fieldData) => {
      console.log('Got city id for field', fieldData.fieldId);
      const fieldWithCityInserted = await insertStationToField(fieldData);
      console.log('Inserted CityID, on field: ', fieldWithCityInserted);
    })
}

const fieldsWithNoStationId = async () => {
  const dataPoints = await knex.raw('SELECT field_id, grid_points FROM field WHERE station_id  IS NULL');
  return dataPoints.rows.map(({ field_id, grid_points }) => ({ fieldId: field_id, point: grid_points[0] }));
}

function getStationIdFromField({ fieldId, point }) {
  const options = {
    uri: endPoints.openWeatherAPI,
    qs: {
      lon: point.lng,
      lat: point.lat,
      units: 'metric',
      APPID: OPEN_WEATHER_APP_ID,
    },
  }
  return rp(options).then((result) => {
    console.log('got from field', result);
    return Object.assign(JSON.parse(result), { fieldId })
  });
}


async function insertStationToField(result) {
  const { fieldId, id, name, timezone, sys } = result;
  const queryResult = await knex('weather_station').where({ id });
  if (queryResult.length) {
    return await knex('field').where({ field_id: fieldId }).update({ station_id: id }).returning('*');
  } else {
    console.log('adding weather station ', name, id);
    await knex('weather_station').insert({ id, name, country: sys.country, timezone })
    return await knex('field').where({ field_id: fieldId }).update({ station_id: id }).returning('*');
  }
}

module.exports = {
  mapFieldsToStationId,
};
