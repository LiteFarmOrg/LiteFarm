/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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

import { Client } from '@googlemaps/google-maps-services-js';

const client = new Client({});

async function mapTimeZoneOffsetsToFarms(knex) {
  const date = new Date(Date.now());
  const farmsWithLatLng = await knex('farm').select('*').whereNotNull('grid_points');
  for (const farm of farmsWithLatLng) {
    try {
      const timeZone = await client.timezone({
        params: {
          location: farm.grid_points,
          timestamp: date,
          key: process.env.GOOGLE_API_KEY,
        },
      });
      await knex('farm')
        .update('utc_offset', timeZone.data.rawOffset)
        .where('farm_id', farm.farm_id);
    } catch (e) {
      switch (e.response && e.response.data && e.response.data.status) {
        case 'OVER_QUERY_LIMIT':
          console.log('Hit query limit for timezones API: waiting for query limit to reset');
          await new Promise((resolve) => setTimeout(resolve, 60000)); // Rate limit is on a per-minute basis
          try {
            const timeZone = await client.timezone({
              params: {
                location: farm.grid_points,
                timestamp: new Date(Date.now()),
                key: process.env.GOOGLE_API_KEY,
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
            'Over the daily limit fot the timezones API. Please double check credentials are valid and try again tomorrow',
          );
          throw new Error('OVER_DAILY_LIMIT');
        default:
          console.log(`Unable to set a timezone for farm: ${farm.farm_name}`);
          break;
      }
    }
  }
}

export default mapTimeZoneOffsetsToFarms;
