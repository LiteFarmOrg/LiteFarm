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
import { measurementSelector } from '../userFarmSlice';
import {
  container_planting_depth,
  convertFn,
  roundToTwoDecimal,
} from '../../util/convert-units/unit';
import { useGetSensorsQuery } from '../../store/api/apiSlice';
import { areaSelector } from '../locationSlice';
import { AreaLocation, getAreaLocationsContainingPoint } from '../../util/geoUtils';
import type { SensorData, Sensor, SensorArray } from '../../store/api/types';
import { SensorInSimpleTableFormat } from '../AddSensors/types';
import { Location, System } from '../../types';
import { SENSOR_ARRAY } from '../SensorReadings/constants';

const STANDALONE = 'standalone' as const;

export type SensorSummary = Record<Sensor['name'] | typeof SENSOR_ARRAY, number>;

export type GroupedSensors = {
  id: string;
  point: Sensor['point'];
  fields: Location['name'][];
  isSensorArray: boolean;
  sensors: SensorInSimpleTableFormat[];
};

type FarmAreaLocation = Location & AreaLocation;

const getAreaNamesForPoint = (point: Sensor['point'], areaLocations: FarmAreaLocation[]) => {
  return getAreaLocationsContainingPoint(areaLocations, point).map(({ name }) => name);
};

const formatSensorToSimpleTableFormat = (
  sensor: Sensor,
  system: System,
): SensorInSimpleTableFormat => {
  const { external_id, depth, depth_unit } = sensor;
  const displayUnit = container_planting_depth[system].defaultUnit;
  const convertedDepth = convertFn(container_planting_depth, depth, depth_unit, displayUnit);

  return {
    ...sensor,
    id: external_id,
    formattedDepth: `${roundToTwoDecimal(convertedDepth)}${displayUnit}`,
    deviceTypeKey: sensor.name.toUpperCase().replaceAll(' ', '_'),
  };
};

type SensorsMapKeys = SensorArray['id'] | typeof STANDALONE;
type MappedSensors = { [key: SensorsMapKeys]: SensorInSimpleTableFormat[] };

const formatSensorArrayToGroup = (
  sensorArray: SensorArray,
  mappedSensors: MappedSensors,
  areaLocations: FarmAreaLocation[],
) => {
  return {
    ...sensorArray,
    sensors: mappedSensors[sensorArray.id],
    isSensorArray: true,
    fields: getAreaNamesForPoint(sensorArray.point, areaLocations),
  };
};

const formatSensorToGroup = (
  sensor: SensorInSimpleTableFormat,
  areaLocations: FarmAreaLocation[],
) => {
  return {
    id: `sensor_${sensor.id}`,
    sensors: [sensor],
    point: sensor.point,
    isSensorArray: false,
    fields: getAreaNamesForPoint(sensor.point, areaLocations),
  };
};

const getSummary = (sensors: Sensor[], sensor_arrays: SensorArray[]): SensorSummary => {
  const summaryMap = sensors.reduce(
    (acc, { name }) => {
      if (!(name in acc)) {
        acc[name] = 0;
      }
      acc[name] += 1;

      return acc;
    },
    {} as Record<Sensor['name'], number>,
  );

  return {
    [SENSOR_ARRAY]: sensor_arrays.length,
    ...summaryMap,
  };
};

const formatSensors = (
  getSensorsApiRes: SensorData,
  system: System,
  farmAreas: FarmAreaLocation[],
): { groupedSensors: GroupedSensors[]; sensorSummary: SensorSummary } => {
  const { sensors, sensor_arrays } = getSensorsApiRes;

  const mappedSensors = sensors.reduce<MappedSensors>(
    (acc, sensor) => {
      const key = sensor.sensor_array_id || STANDALONE;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(formatSensorToSimpleTableFormat(sensor, system));

      return acc;
    },
    { [STANDALONE]: [] },
  );

  return {
    sensorSummary: getSummary(sensors, sensor_arrays),
    groupedSensors: [
      ...sensor_arrays.map((sensorArray) =>
        formatSensorArrayToGroup(sensorArray, mappedSensors, farmAreas),
      ),
      ...mappedSensors[STANDALONE].map((sensor) => formatSensorToGroup(sensor, farmAreas)),
    ],
  };
};

const useGroupedSensors = (): {
  isLoading: boolean;
  sensorSummary: SensorSummary;
  groupedSensors: GroupedSensors[];
} => {
  const { data, isLoading } = useGetSensorsQuery();
  const system = useSelector(measurementSelector);
  const farmAreas = useSelector(areaSelector);
  const flattenedFarmAreas = Object.values(farmAreas).flat();

  const sensorsData =
    isLoading || !data
      ? { sensorSummary: {} as SensorSummary, groupedSensors: [] }
      : formatSensors(data, system, flattenedFarmAreas);

  return { isLoading, ...sensorsData };
};

export default useGroupedSensors;
