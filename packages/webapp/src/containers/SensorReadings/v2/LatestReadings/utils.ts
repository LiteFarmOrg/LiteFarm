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
import { Status, StatusIndicatorPillProps } from '../../../../components/StatusIndicatorPill';
import { Sensor, SensorReadings, SensorReadingTypes } from '../../../../store/api/types';
import { System } from '../../../../types';
import { SENSOR_PARAMS } from '../constants';
import { STANDALONE_SENSOR_COLORS } from '../SensorReadings';
import { LineConfig } from '../../../../components/Charts/LineChart';

type TMeasurement = {
  measurement: string;
  value: string | number;
  unit: string;
};

export interface SensorKPIprops extends React.HTMLAttributes<HTMLDivElement> {
  sensor: {
    id: string | number;
    status: StatusIndicatorPillProps;
  };
  discriminator: TMeasurement;
  measurements: TMeasurement[];
  color?: string;
}

export interface SensorReadingKPIprops extends TMeasurement, React.HTMLAttributes<HTMLDivElement> {
  color?: string;
}

export const formatReadingsToSensorKPIProps = (
  sensors: Sensor[],
  readings: SensorReadings[],
  system: System,
  t: TFunction,
  sensorColorMap: LineConfig[],
): SensorKPIprops[] => {
  return sensors.map((sensor) => {
    const { external_id, depth, name } = sensor;
    let isOnline: boolean = false;

    const measurementValueMap: Partial<Record<SensorReadingTypes, number | string>> =
      SENSOR_PARAMS[name]?.reduce((acc, param) => {
        const foundReadings = readings.find(({ reading_type }) => reading_type === param);
        const value =
          foundReadings?.readings?.[foundReadings.readings.length - 1][external_id] || null;
        isOnline = isOnline || !!value;

        return { ...acc, [param]: value };
      }, {}) || {};

    return {
      sensor: {
        id: external_id,
        status: {
          status: isOnline ? Status.ONLINE : Status.OFFLINE,
          pillText: isOnline ? t('STATUS.ONLINE') : t('STATUS.OFFLINE'),
          tooltipText: 'Device has sent data in the last 12 hours',
        },
      },
      discriminator: {
        measurement: 'depth_elevation',
        value: depth,
        unit: system === 'metric' ? 'cm' : 'in',
      },
      measurements:
        SENSOR_PARAMS[name]?.flatMap((param) => {
          if (!readings.find(({ reading_type }) => reading_type === param)) {
            return [];
          }

          return {
            measurement: param,
            value: measurementValueMap[param] || '-',
            unit: '°F',
          };
        }) || [],
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
    SENSOR_PARAMS[sensor.name]?.flatMap((param) => {
      const foundReadings = readings.find(({ reading_type }) => reading_type === param);
      if (!foundReadings) {
        return [];
      }

      const value =
        foundReadings.readings[foundReadings.readings.length - 1][sensor.external_id] || '-';
      return {
        measurement: param,
        value,
        unit: 'C',
        color: STANDALONE_SENSOR_COLORS[sensor.name]?.[param],
      };
    }) || []
  );
};
