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
import { ExternalLocations, ExternalMapLocationType, ExternalPoints } from './types';

const useExternalLocations = () => {
  const { data: sensorData, isLoading: isLoadingSensors } = useGetSensorsQuery();

  const isLoading = isLoadingSensors;

  if (isLoading) {
    return { locations: undefined, isLoading };
  }

  const allSensors = sensorData?.sensors.map((sensor) => ({
    ...sensor,
    isAddonSensor: true,
    type: ExternalMapLocationType.SENSOR,
    figure_type: FigureType.POINT,
  }));

  const sensorArrays = sensorData?.sensor_arrays.map((sensorArray) => ({
    ...sensorArray,
    isAddonSensor: true,
    type: ExternalMapLocationType.SENSOR_ARRAY,
    figure_type: FigureType.POINT,
  }));

  const standaloneSensors = allSensors?.filter((sensor) => sensor.sensor_array_id === null);

  let points: ExternalPoints = {};
  if (standaloneSensors?.length) {
    points.sensor = [...standaloneSensors];
  }
  if (sensorArrays?.length) {
    points.sensor_array = [...sensorArrays];
  }

  let locations: ExternalLocations = {};
  if (
    [ExternalMapLocationType.SENSOR, ExternalMapLocationType.SENSOR_ARRAY].some(
      (type) => type in points,
    )
  ) {
    locations.point = { ...points };
  }

  return {
    locations,
    isLoading,
  };
};

export default useExternalLocations;
