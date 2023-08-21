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

import mapTimeZoneOffsetsToFarms from '../../src/jobs/station_sync/updateTimeZoneOffsets.js';

export const up = async function (knex) {
  if (['integration', 'production'].includes(process.env.NODE_ENV)) {
    await mapTimeZoneOffsetsToFarms(knex);
  }
};

export const down = async function (knex) {
  if (['integration', 'production'].includes(process.env.NODE_ENV)) {
    await knex('farm').update('utc_offset', null);
  }
};
