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

import { useGetSensorsQuery } from '../../store/api/apiSlice';
import { FigureType } from '../../store/api/types';

const useExternalLocations = () => {
  const { data: sensorData = { sensors: [], sensor_arrays: [] }, isLoading: isLoadingSensors } =
    useGetSensorsQuery();

  const isLoading = isLoadingSensors;

  if (isLoading) {
    return { locations: [], isLoading };
  }

  const allSensors = sensorData.sensors.map((sensor) => ({
    ...sensor,
    isAddonSensor: 'true',
    type: 'sensor',
    figure_type: FigureType.POINT,
  }));

  const sensorArrays = sensorData.sensor_arrays.map((sensorArray) => ({
    ...sensorArray,
    isAddonSensor: 'true',
    type: 'sensor_array',
    figure_type: FigureType.POINT,
  }));

  const standaloneSensors = allSensors?.filter((sensor) => sensor.sensor_array_id === null);

  return {
    locations: {
      point: {
        sensor: [...standaloneSensors],
        sensor_array: [...sensorArrays],
      },
    },
    isLoading,
  };
};

export default useExternalLocations;
