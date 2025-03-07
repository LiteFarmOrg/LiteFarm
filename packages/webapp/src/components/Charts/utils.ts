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

import { getNextDateTime, getUnixTime } from '../../containers/SensorReadings/v2/utils';
import { TruncPeriod } from './LineChart';

export const getLocalDate = (date: string) => {
  const [y, m, d] = date.split('-');
  return new Date(+y, +m - 1, +d);
};

const getMonthlyTicks = (startDate: string, endDate: string) => {
  const endDateInMilliseconds = getLocalDate(endDate).getTime();
  let currentDate = getLocalDate(startDate);
  const ticks = [];

  if (currentDate.getDate() !== 1) {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  }

  while (currentDate.getTime() <= endDateInMilliseconds) {
    ticks.push(getUnixTime(currentDate));
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  }

  return ticks;
};

const getDailyTicks = (startDate: string, endDate: string) => {
  const ticks = [];

  const endDateUnixTime = getUnixTime(getLocalDate(endDate));
  let currentUnixTime = getUnixTime(getLocalDate(startDate));

  while (currentUnixTime <= endDateUnixTime) {
    ticks.push(currentUnixTime);
    currentUnixTime = getNextDateTime(currentUnixTime, 'day');
  }

  return ticks;
};

export const getTicks = (startDate: string, endDate: string, truncPeriod: TruncPeriod) => {
  if (truncPeriod === 'day') {
    const endDateObj = getLocalDate(endDate);
    const firstDayOfPreviousMonth = new Date(
      endDateObj.getFullYear(),
      endDateObj.getMonth() - 1,
      1,
    );

    if (getUnixTime(startDate) <= getUnixTime(firstDayOfPreviousMonth)) {
      return getMonthlyTicks(startDate, endDate);
    }
  }

  return getDailyTicks(startDate, endDate);
};
