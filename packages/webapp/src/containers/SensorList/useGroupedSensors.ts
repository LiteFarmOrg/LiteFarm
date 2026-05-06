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
import { container_planting_depth, convertFn } from '../../util/convert-units/unit';
import { roundToOne } from '../../util/rounding';
import { useGetSensorsQuery } from '../../store/api/apiSlice';
import { getAreaLocationsContainingPoint } from '../../util/geoUtils';
import { type SensorData, type Sensor, type SensorArray, FigureType } from '../../store/api/types';
import { SensorInSimpleTableFormat } from '../AddSensors/types';
import { System } from '../../types';
import useLocations from '../../hooks/location/useLocations';
import {
  ExternalMapLocationType,
  FlattenedField,
  FlattenedInternalArea,
} from '../../hooks/location/types';

const STANDALONE = 'standalone' as const;

export enum SensorType {
  SENSOR = ExternalMapLocationType.SENSOR,
  SENSOR_ARRAY = ExternalMapLocationType.SENSOR_ARRAY,
}

export type SensorSummary = Record<Sensor['name'] | typeof SensorType.SENSOR_ARRAY, number>;

export type GroupedSensors = {
  id: string;
  label?: string;
  system?: string;
  point: Sensor['point'];
  fields: Pick<FlattenedField, 'name' | 'location_id'>[];
  type: SensorType;
  sensors: SensorInSimpleTableFormat[];
};

const getAreaDataForPoint = (point: Sensor['point'], areaLocations: FlattenedInternalArea[]) => {
  return getAreaLocationsContainingPoint(areaLocations, point).map(({ name, location_id }) => ({
    name,
    location_id,
  }));
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
    formattedDepth: `${roundToOne(convertedDepth)}${displayUnit}`,
    deviceTypeKey: sensor.name.toUpperCase().replaceAll(' ', '_'),
  };
};

type SensorsMapKeys = SensorArray['id'] | typeof STANDALONE;
type MappedSensors = { [key: SensorsMapKeys]: SensorInSimpleTableFormat[] };

const formatSensorArrayToGroup = (
  sensorArray: SensorArray,
  mappedSensors: MappedSensors,
  areaLocations: FlattenedInternalArea[],
) => {
  return {
    ...sensorArray,
    sensors: mappedSensors[sensorArray.id],
    type: SensorType.SENSOR_ARRAY,
    fields: getAreaDataForPoint(sensorArray.point, areaLocations),
    isAddonSensor: true,
  };
};

const formatSensorToGroup = (
  sensor: SensorInSimpleTableFormat,
  areaLocations: FlattenedInternalArea[],
) => {
  return {
    id: `sensor_${sensor.id}`,
    label: sensor.label,
    location_id: sensor.location_id,
    sensors: [sensor],
    point: sensor.point,
    type: SensorType.SENSOR,
    fields: getAreaDataForPoint(sensor.point, areaLocations),
    isAddonSensor: true,
  };
};

const getSummary = (sensors: Sensor[], sensor_arrays: SensorArray[]): SensorSummary => {
  const summaryMap = sensors.reduce((acc, { name }) => {
    if (!(name in acc)) {
      acc[name] = 0;
    }
    acc[name] += 1;

    return acc;
  }, {} as Record<Sensor['name'], number>);

  return {
    [SensorType.SENSOR_ARRAY]: sensor_arrays.length,
    ...summaryMap,
  };
};

const formatSensors = (
  getSensorsApiRes: SensorData,
  system: System,
  farmAreas: FlattenedInternalArea[],
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
  const { data: sensors, isLoading: isLoadingSensors } = useGetSensorsQuery();
  const system = useSelector(measurementSelector);
  const { locations: farmAreas, isLoading: isLoadingFarmAreas } = useLocations({
    filterBy: FigureType.AREA,
  });

  const isLoading = isLoadingSensors || isLoadingFarmAreas;
  const dataNotReady = !sensors || !farmAreas;

  const sensorsData =
    isLoading || dataNotReady
      ? { sensorSummary: {} as SensorSummary, groupedSensors: [] }
      : formatSensors(sensors, system, farmAreas);

  return { isLoading, ...sensorsData };
};

export default useGroupedSensors;
