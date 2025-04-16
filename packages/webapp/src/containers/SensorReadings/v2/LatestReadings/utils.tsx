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

import { CSSProperties } from 'react';
import { TFunction } from 'react-i18next';
import { LineConfig } from '../../../../components/Charts/LineChart';
import { convertEsciReadingValue, degToDirection, getReadingUnit, getStatusProps } from '../utils';
import { isValidNumber } from '../../../../util/validation';
import { convert } from '../../../../util/convert-units/convert';
import {
  SENSOR_READING_TYPES,
  SENSOR_ARRAY_CHART_PARAMS,
  STANDALONE_SENSOR_COLORS_MAP,
  WEATHER_STATION_KPI_DEFAULT_LABEL_KEYS,
  WEATHER_STATION_KPI_PARAMS,
} from '../constants';
import { SensorKPIprops } from '../../../../components/Tile/SensorTile/SensorKPI';
import {
  SensorReadingKPIprops,
  type TMeasurement,
} from '../../../../components/Tile/SensorTile/SensorReadingKPI';
import {
  Sensor,
  SensorDatapoint,
  SensorReadings,
  type SensorTypes,
  type SensorReadingTypes,
  type SensorReadingTypeUnits,
} from '../../../../store/api/types';
import type { System } from '../../../../types';
import type { TileData } from '../../../../components/Tile/DescriptionListTile';
import Arrow from '../../../../assets/images/arrow-circle-up.svg';
import styles from '../styles.module.scss';

const getLatestReadingValue = (
  readings: SensorDatapoint[],
  externalId: string,
): number | undefined => {
  return readings.length ? readings[readings.length - 1][externalId] : undefined;
};

const generateTMeasurement = (
  readingType: SensorReadingTypes,
  value: number | undefined,
  unit: SensorReadingTypeUnits | undefined,
  system: System | undefined,
  t: TFunction,
): TMeasurement => {
  return {
    measurement: t(`SENSOR.READING.${readingType.toUpperCase()}`),
    value: value && system ? convertEsciReadingValue(value, readingType, system) : '-',
    unit: (value && unit && system && getReadingUnit(readingType, system, unit)) || '',
  };
};

// Format function for sensor array
export const formatArrayReadingsToKPIProps = (
  sensors: Sensor[],
  sensorReadings: SensorReadings[],
  system: System,
  sensorColorMap: LineConfig[],
  t: TFunction,
): SensorKPIprops[] => {
  const displayDepthUnit = system === 'metric' ? 'cm' : 'in';
  const supportedReadingsInOrder = SENSOR_ARRAY_CHART_PARAMS.flatMap((param) => {
    return sensorReadings.find(({ reading_type }) => reading_type === param) || [];
  });

  return sensors.map(({ external_id, depth, last_seen }) => {
    const measurements = supportedReadingsInOrder.map(({ reading_type, readings, unit }) => {
      const value = getLatestReadingValue(readings, external_id);

      return generateTMeasurement(reading_type, value, unit, system, t);
    });

    return {
      sensor: {
        id: external_id,
        status: getStatusProps(last_seen, t),
      },
      discriminator: {
        measurement: 'depth_elevation',
        value: convert(depth).from('cm').to(displayDepthUnit),
        unit: displayDepthUnit,
      },
      measurements,
      color: sensorColorMap.find(({ id }) => id === external_id)!.color,
    };
  });
};

// Format function for sensor
export const formatStandaloneSensorReadingsToKPIProps = (
  sensor: Sensor,
  readings: SensorReadings[],
  system: System,
  t: TFunction,
): TileData[] | SensorReadingKPIprops[] => {
  if (sensor.name === 'Weather station') {
    return formatSensorReadingsToWeatherKPIProps(sensor, readings, system, t);
  }

  const result = SENSOR_READING_TYPES[sensor.name].flatMap((param) => {
    const foundReadings = readings.find(({ reading_type }) => reading_type === param);
    if (!foundReadings) {
      return [];
    }

    const value = getLatestReadingValue(foundReadings.readings, sensor.external_id);

    return {
      ...generateTMeasurement(param, value, foundReadings.unit, system, t),
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
): TileData | undefined => {
  const speedReadings = sensorReadingsMap['wind_speed'];
  const directionReadings = sensorReadingsMap['wind_direction'];
  if (!speedReadings && !directionReadings) {
    return undefined;
  }

  let speedData = '';
  let directionDegree: number | undefined;
  let directionText = '';

  if (speedReadings) {
    const latestValue = getLatestReadingValue(speedReadings.readings, sensor.external_id);

    if (isValidNumber(latestValue)) {
      const convertedValue = convertEsciReadingValue(latestValue, 'wind_speed', system);
      const displayUnit = getReadingUnit('wind_speed', system, speedReadings.unit);
      speedData = `${convertedValue}${displayUnit}`;
    } else {
      speedData = '-';
    }
  }

  if (directionReadings) {
    directionDegree = getLatestReadingValue(directionReadings.readings, sensor.external_id);
    directionText = isValidNumber(directionDegree) ? t(degToDirection(directionDegree)) : '-';
  }

  if (speedData && directionText) {
    const data = speedData === '-' && directionText === '-' ? '-' : undefined;

    return {
      label: t('SENSOR.READING.WIND_SPEED_AND_DIRECTION'),
      data: data || (
        <WindSpeedDirectionData
          speed={speedData}
          directionDegree={directionDegree}
          directionText={directionText}
        />
      ),
    };
  }

  if (speedData) {
    return { label: t('SENSOR.READING.WIND_SPEED'), data: speedData };
  }

  return {
    label: t('SENSOR.READING.WIND_DIRECTION'),
    data: (
      <WindSpeedDirectionData directionDegree={directionDegree} directionText={directionText} />
    ),
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
      return formatWindData(sensor, sensorReadingsMap, system, t) || [];
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
  sensorName: Exclude<SensorTypes, 'Weather station'>,
  t: TFunction,
): SensorReadingKPIprops[] => {
  return SENSOR_READING_TYPES[sensorName].map((key) => ({
    ...generateTMeasurement(key, undefined, undefined, undefined, t),
    color: STANDALONE_SENSOR_COLORS_MAP[key],
  }));
};

const getWeatherStationDefaultKPIProps = (t: TFunction): TileData[] => {
  return WEATHER_STATION_KPI_DEFAULT_LABEL_KEYS.map((key) => ({
    label: t(`SENSOR.READING.${key}`),
    data: '-',
  }));
};
