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
import { type ChartTruncPeriod } from '../../../components/Charts/LineChart';
import { getDateDifference } from '../../../util/moment';
import { roundToTwo } from '../../../components/Map/PreviewPopup/utils';
import { convert } from '../../../util/convert-units/convert';
import { esciUnitTypeMap } from './constants';
import {
  SensorDatapoint,
  type SensorReadingTypes,
  type SensorReadingTypeUnits,
} from '../../../store/api/types';
import type { System } from '../../../types';
import { FormattedSensorDatapoint } from './types';
import { Status } from '../../../components/StatusIndicatorPill';

const WIND_DIRECTION_KEYS = [
  'N', // t('N')
  'NNE', // t('NNE')
  'NE', // t('NE')
  'ENE', // t('ENE')
  'E', // t('E')
  'ESE', // t('ESE')
  'SE', // t('SE')
  'SSE', // t('SSE')
  'S', // t('S')
  'SSW', // t('SSW')
  'SW', // t('SW')
  'WSW', // t('WSW')
  'W', // t('W')
  'WNW', // t('WNW')
  'NW', // t('NW')
  'NNW', // t('NNW')
];
const NUM_OF_DIRECTIONS = WIND_DIRECTION_KEYS.length;
const ANGLE_PER_DIRECTION = 360 / NUM_OF_DIRECTIONS;

const SECONDS_IN_A_DAY = 86400; // 60 * 60 * 24
const SECONDS_IN_AN_HOUR = 3600; // 60 * 60

export const sortDataByDateTime = (data: SensorDatapoint[]) => {
  return data.slice().sort((a, b) => a.dateTime - b.dateTime);
};

/**
 * Converts the dateTime returned from getSensorReadings.
 *
 * We provide the date with 12 AM local time (e.g., Mar 28).
 * - If the user is 3 hours ahead of UTC, the date will be Mar 27, 9 PM UTC.
 * - If the user is 3 hours behind UTC, the date will be Mar 28, 3 AM UTC.
 *
 * The ESci API returns data for 12 AM UTC on the corresponding UTC date.
 * This function adjusts the UTC-based timestamps back to the intended local date.
 */
export const getAdjustDateTimeFunc = (
  truncPeriod: ChartTruncPeriod,
  timezoneOffset?: number,
): ((dateTime: number) => number) | undefined => {
  if (timezoneOffset === undefined) {
    return undefined;
  }

  if (truncPeriod === 'hour') {
    return getAdjustHourlyDateTimeFunc(timezoneOffset);
  } else if (truncPeriod === 'day') {
    return adjustDailyDateTime;
  }
};

const adjustDailyDateTime = (dateTime: number): number => {
  const date = new Date(dateTime * 1000);
  const utcYear = date.getUTCFullYear();
  const utcMonth = date.getUTCMonth();
  const utcDate = date.getUTCDate();

  const timeOffset = new Date(utcYear, utcMonth, utcDate).getTimezoneOffset();

  if (timeOffset === 0) {
    return dateTime;
  }

  const isAheadUTC = timeOffset < 0;

  return new Date(utcYear, utcMonth, utcDate + (isAheadUTC ? 1 : 0)).getTime() / 1000;
};

const getAdjustHourlyDateTimeFunc = (
  timezoneOffset: number,
): ((dateTime: number) => number) | undefined => {
  const minuteOffset = timezoneOffset % 60;

  // Handle time offset when the difference is not full hour
  if (minuteOffset) {
    const isAheadUTC = timezoneOffset < 0;
    return (dateTime: number) => dateTime + minuteOffset * (isAheadUTC ? 1 : -1) * 60;
  }

  return undefined;
};

export const formatDataPoint = (
  data: SensorDatapoint,
  dataKeys: string[],
  valueConverter?: (value: number) => number | null,
  adjustDateTime?: (dateTime: number) => number,
): FormattedSensorDatapoint => {
  return dataKeys.reduce<FormattedSensorDatapoint>(
    (acc, dataKey) => {
      const value =
        valueConverter && typeof data[dataKey] === 'number'
          ? valueConverter(data[dataKey])
          : (data[dataKey] ?? null);

      return { ...acc, [dataKey]: value };
    },
    { dateTime: adjustDateTime?.(data.dateTime) || data.dateTime },
  );
};

export const getNextDateTime = (baseUnixTime: number, truncPeriod: ChartTruncPeriod) => {
  return baseUnixTime + (truncPeriod === 'day' ? SECONDS_IN_A_DAY : SECONDS_IN_AN_HOUR);
};

export const formatSensorsData = (
  data: SensorDatapoint[],
  truncPeriod: ChartTruncPeriod,
  dataKeys: string[],
  valueConverter?: (value: number) => number | null,
  timezoneOffset?: number,
): FormattedSensorDatapoint[] => {
  if (!data.length) {
    return [];
  }

  const adjustDateTime = getAdjustDateTimeFunc(truncPeriod, timezoneOffset);

  let result: FormattedSensorDatapoint[] = [];
  let currentTimeStamp = data[0].dateTime;
  let dataPointer = 0;

  while (dataPointer < data.length || currentTimeStamp <= data[data.length - 1].dateTime) {
    let nextDateTime = getNextDateTime(currentTimeStamp, truncPeriod);

    if (currentTimeStamp === data[dataPointer].dateTime) {
      result.push(formatDataPoint(data[dataPointer], dataKeys, valueConverter, adjustDateTime));
      dataPointer++;
    } else {
      // Insert a placeholder entry for a missing timestamp
      result.push(
        formatDataPoint({ dateTime: currentTimeStamp }, dataKeys, undefined, adjustDateTime),
      );

      // Use the dateTime from the next available data point
      nextDateTime = data[dataPointer].dateTime;
    }

    while (dataPointer < data.length && nextDateTime > data[dataPointer].dateTime) {
      // Add existing data points until the next expected timestamp is reached
      result.push(formatDataPoint(data[dataPointer], dataKeys, valueConverter, adjustDateTime));
      dataPointer++;
    }

    currentTimeStamp = nextDateTime;
  }

  return result;
};

export const getTruncPeriod = (startDate?: Date, endDate?: Date): ChartTruncPeriod | undefined => {
  if (!startDate || !endDate) {
    return undefined;
  }

  const dateRange = getDateDifference(startDate, endDate);

  if (dateRange < 8) {
    return 'hour';
  }

  return 'day';
};

export const convertEsciReadingValue = (
  value: number,
  param: SensorReadingTypes,
  system: System,
): number => {
  if (esciUnitTypeMap[param]) {
    const unitType = esciUnitTypeMap[param];
    return roundToTwo(convert(value).from(unitType.baseUnit).to(unitType[system].unit));
  }

  return roundToTwo(value);
};

export const getReadingUnit = (
  param: SensorReadingTypes,
  system: System,
  apiUnit: SensorReadingTypeUnits,
): string => {
  if (esciUnitTypeMap[param]) {
    return esciUnitTypeMap[param][system].displayUnit;
  }

  return apiUnit;
};

export const degToDirection = (deg: number): string => {
  // Normalize degrees to 0–359
  const normalizedDeg = ((deg % 360) + 360) % 360;

  const index =
    Math.floor((normalizedDeg + ANGLE_PER_DIRECTION / 2) / ANGLE_PER_DIRECTION) % NUM_OF_DIRECTIONS;

  return WIND_DIRECTION_KEYS[index];
};

export const getStatusProps = (lastSeen: string, t: TFunction) => {
  const isOnline = lastSeen
    ? new Date(lastSeen).getTime() >= new Date().getTime() - 2 * 60 * 60 * 1000
    : false;

  return {
    status: isOnline ? Status.ONLINE : Status.OFFLINE,
    pillText: isOnline ? t('STATUS.ONLINE') : t('STATUS.OFFLINE'),
    tooltipText: isOnline ? t('STATUS.SENSOR.ONLINE_TOOLTIP') : t('STATUS.SENSOR.OFFLINE_TOOLTIP'),
  };
};
