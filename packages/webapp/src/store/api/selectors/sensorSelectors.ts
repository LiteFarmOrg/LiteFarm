/*
 *  Copyright 2025 LiteFarm.org
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

import { createSelector } from '@reduxjs/toolkit';
import { api } from '../apiSlice';

// For map use / to use with old selectors only (e.g. pointSelector). In components, use the query hook and selectFromWithin

export const sensorArraysSelector = createSelector(
  [api.endpoints.getSensors.select()],
  (sensorResult) =>
    sensorResult.data?.profiles.map((profile) => ({
      ...profile,
      type: 'sensor', // until icon exists for sensor_array
    })) || [],
);

export const standaloneSensorsSelector = createSelector(
  [api.endpoints.getSensors.select()],
  (sensorResult) => {
    const profileSensorIds =
      sensorResult.data?.profiles.flatMap((profile) => profile.sensors) || [];
    return (
      sensorResult.data?.sensors
        .filter((sensor) => !profileSensorIds.includes(sensor.external_id))
        .map((sensor) => ({ ...sensor, type: 'sensor' })) || []
    );
  },
);
