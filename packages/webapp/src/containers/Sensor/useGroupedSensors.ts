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

import { useSelector } from 'react-redux';
import i18n from '../../locales/i18n';
import { measurementSelector } from '../userFarmSlice';
import {
  container_planting_depth,
  convertFn,
  roundToTwoDecimal,
} from '../../util/convert-units/unit';
import { useGetSensorsQuery } from '../../store/api/apiSlice';
import type { SensorData, Sensor, SensorArray } from '../../store/api/types';
import { SensorInSimpleTableFormat } from '../LocationDetails/PointDetails/SensorDetail/v2/types';
import { System } from '../../types';

const STANDALONE = 'standalone' as const;

export type GroupedSensors = {
  id: string;
  point: Sensor['point'];
  sensors: SensorInSimpleTableFormat[];
  isSensorArray: boolean;
};

const formatSensorToSimpleTableFormat = (
  sensor: Sensor,
  system: System,
): SensorInSimpleTableFormat => {
  const { external_id, depth, depth_unit, sensor_reading_types } = sensor;
  const toUnit = container_planting_depth[system].defaultUnit;
  const convertedDepth = convertFn(container_planting_depth, depth, depth_unit, toUnit);

  return {
    ...sensor,
    id: external_id,
    formattedDepth: `${roundToTwoDecimal(convertedDepth)}${toUnit}`,
    deviceTypes: sensor_reading_types.map((type) => i18n.t(`SENSOR.READING.${type.toUpperCase()}`)),
  };
};

const formatSensorToGroupedSensor = (sensor: SensorInSimpleTableFormat): GroupedSensors => {
  return {
    id: `${sensor.sensor_array_id}_${sensor.id}`,
    sensors: [sensor],
    point: sensor.point,
    isSensorArray: false,
  };
};

type SensorsMapKeys = SensorArray['id'] | typeof STANDALONE;

const formatSensorsToGroups = (getSensorsApiRes: SensorData, system: System): GroupedSensors[] => {
  const { sensors, sensor_arrays } = getSensorsApiRes;

  const mappedSensors: { [key: SensorsMapKeys]: SensorInSimpleTableFormat[] } = {};

  sensors.forEach((sensor) => {
    const key = sensor.sensor_array_id || STANDALONE;
    if (!mappedSensors[key]) {
      mappedSensors[key] = [];
    }

    mappedSensors[key].push(formatSensorToSimpleTableFormat(sensor, system));
  });

  const groupedSensors = sensor_arrays.map((sensorArray) => {
    return { ...sensorArray, sensors: mappedSensors[sensorArray.id], isSensorArray: true };
  });

  return [...groupedSensors, ...mappedSensors[STANDALONE].map(formatSensorToGroupedSensor)];
};

const useGroupedSensors = () => {
  const { data } = useGetSensorsQuery();
  const system = useSelector(measurementSelector);

  return data ? formatSensorsToGroups(data, system) : [];
};

export default useGroupedSensors;
