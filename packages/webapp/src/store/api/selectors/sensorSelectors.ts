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
import { loginSelector } from '../../../containers/userFarmSlice';

// For map use / to use with old selectors only (e.g. pointSelector). In components, use the query hook and selectFromWithin

const selectSensorsData = createSelector(
  [
    loginSelector,
    (state) => state, // Just pass state, don't type it here
  ],
  (login, state) => {
    const { farm_id } = login;
    if (!farm_id) return undefined;

    // Call the selector directly with state
    return api.endpoints.getSensors.select({ farm_id })(state);
  },
);

export const allSensorsSelector = createSelector(
  [selectSensorsData],
  (sensorResult) =>
    sensorResult?.data?.sensors.map((sensor) => ({
      ...sensor,
      isAddonSensor: 'true',
      type: 'sensor',
    })) ?? [],
);

export const sensorArraysSelector = createSelector(
  [selectSensorsData],
  (sensorResult) =>
    sensorResult?.data?.sensor_arrays.map((sensorArray) => ({
      ...sensorArray,
      isAddonSensor: 'true',
      type: 'sensor_array',
    })) ?? [],
);

export const standaloneSensorsSelector = createSelector(
  [allSensorsSelector],
  (allSensors) => allSensors?.filter((sensor) => sensor.sensor_array_id === null) || [],
);
