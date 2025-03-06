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
import { type TruncPeriod } from '../../../components/Charts/LineChart';

interface FormattedSensorDatapoint {
  dateTime: SensorDatapoint['dateTime'];
  [key: string]: number | null;
}

export const getUnixTime = (date: string | Date) => {
  return new Date(date).getTime() / 1000;
};

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

export const getNextDateTime = (baseUnixTime: number, truncPeriod: TruncPeriod) => {
  return baseUnixTime + (truncPeriod === 'day' ? 60 * 60 * 24 : 60 * 60);
};

export const formatSensorsData = (
  data: SensorDatapoint[],
  truncPeriod: TruncPeriod,
  dataKeys: string[],
): FormattedSensorDatapoint[] => {
  if (!data.length) {
    return [];
  }

  const sortedData = sortDataByDateTime(data);
  let result = [];
  let currentTimeStamp = sortedData[0].dateTime;
  let dataPointer = 0;

  while (
    dataPointer < sortedData.length ||
    currentTimeStamp <= sortedData[sortedData.length - 1].dateTime
  ) {
    if (currentTimeStamp === sortedData[dataPointer].dateTime) {
      result.push(fillMissingDataWithNull(sortedData[dataPointer], dataKeys));
      dataPointer++;
    } else {
      // Insert a placeholder entry for a missing timestamp
      result.push(fillMissingDataWithNull({ dateTime: currentTimeStamp }, dataKeys));
    }

    const nextDateTime = getNextDateTime(currentTimeStamp, truncPeriod);

    while (dataPointer < sortedData.length && nextDateTime > sortedData[dataPointer].dateTime) {
      // Add existing data points until the next expected timestamp is reached
      result.push(fillMissingDataWithNull(sortedData[dataPointer], dataKeys));
      dataPointer++;
    }

    currentTimeStamp = getNextDateTime(currentTimeStamp, truncPeriod);
  }

  return result;
};
