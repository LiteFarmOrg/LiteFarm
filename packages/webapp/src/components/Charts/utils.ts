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

import { getUnixTime } from '../../containers/SensorReadings/v2/utils';
import { getDateDifference } from '../../util/moment';
import { TruncPeriod } from './LineChart';

export const getLocalDate = (date: string) => {
  const [y, m, d] = date.split('-');
  return new Date(+y, +m - 1, +d);
};

const getMonthlyTicks = (startDate: Date, endDate: Date) => {
  const endDateInMilliseconds = endDate.getTime();
  const ticks = [];
  let currentDate =
    startDate.getDate() === 1
      ? startDate
      : new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);

  while (currentDate.getTime() <= endDateInMilliseconds) {
    ticks.push(getUnixTime(currentDate));
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  }

  return ticks;
};

const getDailyTicks = (startDate: Date, endDate: Date) => {
  const ticks = [];

  const endDateUnixTime = getUnixTime(endDate);
  let currentUnixTime = getUnixTime(startDate);

  const dateDiff = getDateDifference(startDate, endDate);
  const tickSpanInSeconds = 60 * 60 * 24 * Math.ceil((dateDiff + 1) / 7);

  while (currentUnixTime <= endDateUnixTime) {
    ticks.push(currentUnixTime);
    currentUnixTime += tickSpanInSeconds;
  }

  return ticks;
};

export const getTicks = (
  startDate: string,
  endDate: string,
  truncPeriod: TruncPeriod,
  option?: {
    skipEmptyEndTicks: boolean;
    lastDataPointDateTime: number;
  },
) => {
  const startDateObj = getLocalDate(startDate);

  const lastDate = option?.skipEmptyEndTicks
    ? new Date(option.lastDataPointDateTime * 1000)
    : getLocalDate(endDate);

  if (truncPeriod === 'day') {
    const firstDayOfPreviousMonth = new Date(lastDate.getFullYear(), lastDate.getMonth() - 1, 1);

    if (getUnixTime(startDateObj) <= getUnixTime(firstDayOfPreviousMonth)) {
      return getMonthlyTicks(startDateObj, lastDate);
    }
  }

  return getDailyTicks(startDateObj, lastDate);
};
