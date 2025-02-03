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
import type { SensorData, Sensor, SensorArray } from '../../store/api/types';

export type SensorWithId = Sensor & { id: string };

export type GroupedSensor = {
  id: string;
  point: Sensor['point'];
  sensors: SensorWithId[];
};

const formatSensorToGroupedSensor = (sensor: SensorWithId): GroupedSensor => {
  return {
    id: `${sensor.sensor_array_id}_${sensor.id}`,
    sensors: [sensor],
    point: sensor.point,
  };
};

const formatSensors = (getSensorsApiRes: SensorData): GroupedSensor[] => {
  const { sensors, sensor_arrays } = getSensorsApiRes;

  const mappedSensors: { [key: SensorArray['id'] | 'standalone']: SensorWithId[] } = {};
  sensors.forEach((sensor) => {
    const key = sensor.sensor_array_id || 'standalone';
    if (!mappedSensors[key]) {
      mappedSensors[key] = [];
    }

    mappedSensors[key].push({ ...sensor, id: sensor.external_id });
  });

  const groupedSensors = sensor_arrays.map((sensorArray) => {
    return { ...sensorArray, sensors: mappedSensors[sensorArray.id] };
  });

  return [...groupedSensors, ...mappedSensors['standalone'].map(formatSensorToGroupedSensor)];
};

const useGroupedSensors = () => {
  const { data } = useGetSensorsQuery();

  return data ? formatSensors(data) : [];
};

export default useGroupedSensors;
