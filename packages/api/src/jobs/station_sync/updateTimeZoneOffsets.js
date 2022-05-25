const { Client } = require('@googlemaps/google-maps-services-js');

const client = new Client({});

async function mapTimeZoneOffsetsToFarms(knex) {
  const farmsWithLatLng = await knex('farm').select('*').whereNotNull('grid_points');
  for (const farm of farmsWithLatLng) {
    const timeZone = await client.timezone({
      params: {
        location: farm.grid_points,
        timestamp: new Date(Date.now()),
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    await knex('farm')
      .update('utc_offset', Math.round(timeZone.data.rawOffset / 3600))
      .where('farm_id', farm.farm_id);
  }
}

module.exports = mapTimeZoneOffsetsToFarms;
