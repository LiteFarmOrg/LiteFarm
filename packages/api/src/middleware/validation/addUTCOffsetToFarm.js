/*
 *  Copyright (C) 2019-2022 LiteFarm.org
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
const { Client } = require('@googlemaps/google-maps-services-js');
const client = new Client({});

async function addUTCOffsetToFarm(req, res, next) {
  const { grid_points } = req.body;

  if (grid_points) {
    const timeZone = await client.timezone({
      params: {
        location: grid_points,
        timestamp: new Date(Date.now()),
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    req.body.utc_offset = Math.round(timeZone.data.rawOffset / 60);
    return next();
  } else {
    return res.status(400).send('gridPoints must not be null');
  }
}

module.exports = addUTCOffsetToFarm;
