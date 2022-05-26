const { Client } = require('@googlemaps/google-maps-services-js');

const client = new Client({});

async function mapTimeZoneOffsetsToFarms(knex) {
  const farmsWithLatLng = await knex('farm').select('*').whereNotNull('grid_points');
  for (const farm of farmsWithLatLng) {
    try {
      const timeZone = await client.timezone({
        params: {
          location: farm.grid_points,
          timestamp: new Date(Date.now()),
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      });
      await knex('farm')
        .update('utc_offset', Math.round(timeZone.data.rawOffset / 60))
        .where('farm_id', farm.farm_id);
    } catch (e) {
      switch (e.response?.data?.status) {
        case 'OVER_QUERY_LIMIT':
          console.log('Hit query limit for API: waiting for query limit to reset');
          await new Promise((resolve) => setTimeout(resolve, 60000)); // Rate limit is on a per-minute basis
          try {
            const timeZone = await client.timezone({
              params: {
                location: farm.grid_points,
                timestamp: new Date(Date.now()),
                key: process.env.GOOGLE_MAPS_API_KEY,
              },
            });
            await knex('farm')
              .update('utc_offset', timeZone.data.rawOffset)
              .where('farm_id', farm.farm_id);
          } catch (e) {
            console.log(e);
          }
          break;
        case 'OVER_DAILY_LIMIT':
          console.log(
            'Over the daily limit. Please double check credentials are valid and try again tomorrow',
          );
          throw new Error('OVER_DAILY_LIMIT');
        default:
          console.log(`Unable to set a timezone for farm: ${farm.farm_name}`);
          break;
      }
    }
  }
}

module.exports = mapTimeZoneOffsetsToFarms;
