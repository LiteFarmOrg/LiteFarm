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

import { CSSProperties, ReactNode } from 'react';
import { TFunction } from 'react-i18next';
import { LineConfig } from '../../../../components/Charts/LineChart';
import { convertEsciReadingValue, degToDirection, getReadingUnit } from '../utils';
import { isValidNumber } from '../../../../util/validation';
import {
  GENERAL_SENSOR_KPI_DEFAULT_READING_TYPES,
  SENSOR_ARRAY_CHART_PARAMS,
  SENSOR_CHART_PARAMS,
  STANDALONE_SENSOR_COLORS_MAP,
  WEATHER_STATION_KPI_DEFAULT_LABEL_KEYS,
  WEATHER_STATION_KPI_PARAMS,
} from '../constants';
import { SensorKPIprops } from '../../../../components/Tile/SensorTile/SensorKPI';
import { SensorReadingKPIprops } from '../../../../components/Tile/SensorTile/SensorReadingKPI';
import { Sensor, SensorReadings, SensorReadingTypes } from '../../../../store/api/types';
import { Status } from '../../../../components/StatusIndicatorPill';
import type { GeneralSensor } from '../types';
import type { System } from '../../../../types';
import type { TileData } from '../../../../components/Sensor/v2/WeatherKPI';
import Arrow from '../../../../assets/images/arrow-circle-up.svg';
import styles from '../styles.module.scss';

const getLatestReadingValue = (
  readings: SensorReadings['readings'],
  externalId: string,
): number | undefined => {
  return readings.length ? readings[readings.length - 1][externalId] : undefined;
};

// Format function for sensor array
export const formatArrayReadingsToKPIProps = (
  sensors: Sensor[],
  sensorReadings: SensorReadings[],
  system: System,
  sensorColorMap: LineConfig[],
  t: TFunction,
): SensorKPIprops[] => {
  const supportedReadingsInOrder = SENSOR_ARRAY_CHART_PARAMS.flatMap((param) => {
    return sensorReadings.find(({ reading_type }) => reading_type === param) || [];
  });

  return sensors.map(({ external_id, depth }) => {
    let isOnline: boolean = false;

    const measurements = supportedReadingsInOrder.map(({ reading_type, readings, unit }) => {
      const value = getLatestReadingValue(readings, external_id);
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
          showHoverTooltip: false,
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

// Format function for sensor
export const formatSensorReadingsToGeneralKPIProps = (
  sensor: GeneralSensor,
  readings: SensorReadings[],
  system: System,
  t: TFunction,
): SensorReadingKPIprops[] => {
  const result = SENSOR_CHART_PARAMS.flatMap((param) => {
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
  });

  return !!result.length ? result : getGeneralSensorDefaultKPIProps(sensor.name, t);
};

const WindSpeedDirectionData = ({
  speed,
  directionDegree,
  directionText,
}: {
  speed?: string;
  directionDegree?: number;
  directionText: string;
}) => {
  return (
    <span className={styles.windData}>
      {speed}
      <img
        src={Arrow}
        alt={directionText}
        style={{ '--windDeg': directionDegree } as CSSProperties}
      />
    </span>
  );
};

export const formatWindData = (
  sensor: Sensor,
  sensorReadingsMap: Partial<Record<SensorReadingTypes, SensorReadings>>,
  system: System,
  t: TFunction,
): { label: string; data: ReactNode } | [] => {
  const speedReadings = sensorReadingsMap['wind_speed'];
  const directionReadings = sensorReadingsMap['wind_direction'];
  if (!speedReadings && !directionReadings) {
    return [];
  }

  let speedData = '';
  let directionData: number | undefined;
  let directionValue = '';

  if (speedReadings) {
    const latestValue = getLatestReadingValue(speedReadings.readings, sensor.external_id);
    speedData = isValidNumber(latestValue)
      ? `${convertEsciReadingValue(latestValue, 'wind_speed', system)}${getReadingUnit(
          'wind_speed',
          system,
          speedReadings.unit,
        )}`
      : '-';
  }

  if (directionReadings) {
    const latestValue = getLatestReadingValue(directionReadings.readings, sensor.external_id);
    directionValue = isValidNumber(latestValue) ? t(degToDirection(latestValue)) : '-';
    directionData = latestValue;
  }

  if (speedData && directionValue) {
    const data = speedData === '-' && directionValue === '-' && '-';

    return {
      label: t('SENSOR.READING.WIND_SPEED_AND_DIRECTION'),
      data: data || (
        <WindSpeedDirectionData
          speed={speedData}
          directionDegree={directionData}
          directionText={directionValue}
        />
      ),
    };
  }

  if (speedData) {
    return { label: t('SENSOR.READING.WIND_SPEED'), data: speedData };
  }

  return {
    label: t('SENSOR.READING.WIND_DIRECTION'),
    data: <WindSpeedDirectionData directionDegree={directionData} directionText={directionValue} />,
  };
};

export const formatSensorReadingsToWeatherKPIProps = (
  sensor: Sensor,
  sensorReadings: SensorReadings[],
  system: System,
  t: TFunction,
): TileData[] => {
  const sensorReadingsMap = sensorReadings.reduce<
    Partial<Record<SensorReadingTypes, SensorReadings>>
  >((map, readings) => {
    map[readings.reading_type] = readings;
    return map;
  }, {});

  const result = WEATHER_STATION_KPI_PARAMS.flatMap((param) => {
    if (param === 'wind_speed') {
      // Combine with wind_direction later
      return [];
    }

    if (param === 'wind_direction') {
      return formatWindData(sensor, sensorReadingsMap, system, t);
    }

    if (!sensorReadingsMap[param]) {
      return [];
    }

    const { readings, unit } = sensorReadingsMap[param];
    const value = getLatestReadingValue(readings, sensor.external_id);
    const data = isValidNumber(value)
      ? `${convertEsciReadingValue(value, param, system)}${getReadingUnit(param, system, unit)}`
      : '-';

    return {
      label: t(`SENSOR.READING.${param.toUpperCase()}`),
      data,
    };
  });

  return !!result.length ? result : getWeatherStationDefaultKPIProps(t);
};

const getGeneralSensorDefaultKPIProps = (
  sensorName: GeneralSensor['name'],
  t: TFunction,
): SensorReadingKPIprops[] => {
  return GENERAL_SENSOR_KPI_DEFAULT_READING_TYPES[sensorName].map((key) => ({
    measurement: t(`SENSOR.READING.${key.toUpperCase()}`),
    value: '-',
    unit: '',
    color: STANDALONE_SENSOR_COLORS_MAP[key],
  }));
};

const getWeatherStationDefaultKPIProps = (t: TFunction): TileData[] => {
  return WEATHER_STATION_KPI_DEFAULT_LABEL_KEYS.map((key) => ({
    label: t(`SENSOR.READING.${key}`),
    data: '-',
  }));
};
