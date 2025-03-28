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

import { TFunction } from 'react-i18next';
import { LineConfig } from '../../../../components/Charts/LineChart';
import { convertEsciReadingValue, getReadingUnit } from '../utils';
import {
  SENSOR_ARRAY_CHART_PARAMS,
  SENSOR_CHART_PARAMS,
  STANDALONE_SENSOR_COLORS_MAP,
} from '../constants';
import { SensorKPIprops } from '../../../../components/Tile/SensorTile/SensorKPI';
import { SensorReadingKPIprops } from '../../../../components/Tile/SensorTile/SensorReadingKPI';
import { Sensor, SensorReadings } from '../../../../store/api/types';
import { Status } from '../../../../components/StatusIndicatorPill';
import type { System } from '../../../../types';

export const formatReadingsToSensorKPIProps = (
  sensors: Sensor[],
  sensorReadings: SensorReadings[],
  system: System,
  t: TFunction,
  sensorColorMap: LineConfig[],
): SensorKPIprops[] => {
  const supportedReadingsInOrder = SENSOR_ARRAY_CHART_PARAMS.flatMap((param) => {
    return sensorReadings.find(({ reading_type }) => reading_type === param) || [];
  });

  return sensors.map((sensor) => {
    const { external_id, depth } = sensor;
    let isOnline: boolean = false;

    const measurements = supportedReadingsInOrder.map(({ reading_type, readings, unit }) => {
      const value = readings.length && readings[readings.length - 1][external_id];
      isOnline = isOnline || !!value; // TODO: confirm

      return {
        measurement: t(`SENSOR.READING.${reading_type.toUpperCase()}`),
        value: value ? convertEsciReadingValue(value, reading_type, system) : '-',
        unit: (value && unit && getReadingUnit(reading_type, system, unit)) || '',
      };
    });

    return {
      sensor: {
        id: external_id,
        status: {
          status: isOnline ? Status.ONLINE : Status.OFFLINE,
          pillText: isOnline ? t('STATUS.ONLINE') : t('STATUS.OFFLINE'),
          tooltipText: 'Device has sent data in the last 12 hours', // TODO: confirm
        },
      },
      discriminator: {
        measurement: 'depth_elevation',
        value: depth,
        unit: system === 'metric' ? 'cm' : 'in',
      },
      measurements,
      color: sensorColorMap.find(({ id }) => id === external_id)!.color,
    };
  });
};

export const formatReadingsToSensorReadingKPIProps = (
  sensor: Sensor,
  readings: SensorReadings[],
  system: System,
  t: TFunction,
): SensorReadingKPIprops[] => {
  return (
    SENSOR_CHART_PARAMS.flatMap((param) => {
      const foundReadings = readings.find(({ reading_type }) => reading_type === param);
      if (!foundReadings) {
        return [];
      }

      const value = foundReadings.readings[foundReadings.readings.length - 1][sensor.external_id];

      return {
        measurement: t(`SENSOR.READING.${param.toUpperCase()}`),
        value: value ? convertEsciReadingValue(value, param, system) : '-',
        unit: value ? getReadingUnit(param, system, foundReadings.unit) : '',
        color: STANDALONE_SENSOR_COLORS_MAP[param],
      };
    }) || []
  );
};
