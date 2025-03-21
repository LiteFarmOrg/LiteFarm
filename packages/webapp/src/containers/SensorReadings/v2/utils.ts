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

import { SensorDatapoint } from '../../../store/api/types';
import { type ChartTruncPeriod } from '../../../components/Charts/LineChart';

interface FormattedSensorDatapoint {
  dateTime: SensorDatapoint['dateTime'];
  [key: string]: number | null;
}

export const sortDataByDateTime = (data: SensorDatapoint[]) => {
  return data.slice().sort((a, b) => a.dateTime - b.dateTime);
};

export const fillMissingDataWithNull = (
  data: SensorDatapoint,
  dataKeys: string[],
): FormattedSensorDatapoint => {
  return dataKeys.reduce<FormattedSensorDatapoint>(
    (acc, dataKey) => {
      return { ...acc, [dataKey]: data[dataKey] ?? null };
    },
    { dateTime: data.dateTime },
  );
};

export const getNextDateTime = (baseUnixTime: number, truncPeriod: ChartTruncPeriod) => {
  return baseUnixTime + (truncPeriod === 'day' ? 60 * 60 * 24 : 60 * 60);
};

export const formatSensorsData = (
  data: SensorDatapoint[],
  truncPeriod: ChartTruncPeriod,
  dataKeys: string[],
): FormattedSensorDatapoint[] => {
  if (!data.length) {
    return [];
  }

  let result = [];
  let currentTimeStamp = data[0].dateTime;
  let dataPointer = 0;

  while (dataPointer < data.length || currentTimeStamp <= data[data.length - 1].dateTime) {
    let nextDateTime = getNextDateTime(currentTimeStamp, truncPeriod);

    if (currentTimeStamp === data[dataPointer].dateTime) {
      result.push(fillMissingDataWithNull(data[dataPointer], dataKeys));
      dataPointer++;
    } else {
      // Insert a placeholder entry for a missing timestamp
      result.push(fillMissingDataWithNull({ dateTime: currentTimeStamp }, dataKeys));

      // Use the dateTime from the next available data point
      nextDateTime = data[dataPointer].dateTime;
    }

    while (dataPointer < data.length && nextDateTime > data[dataPointer].dateTime) {
      // Add existing data points until the next expected timestamp is reached
      result.push(fillMissingDataWithNull(data[dataPointer], dataKeys));
      dataPointer++;
    }

    currentTimeStamp = nextDateTime;
  }

  return result;
};
