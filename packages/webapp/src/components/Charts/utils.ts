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

const MAX_TICKS = 7;

export const getLocalDate = (date: string) => {
  const [y, m, d] = date.split('-');
  return new Date(+y, +m - 1, +d);
};

const getMonthlyTicks = (startDate: Date, endDate: Date): number[] => {
  const endDateInMilliseconds = endDate.getTime();
  const ticks = [];
  let currentDate =
    startDate.getDate() === 1
      ? startDate
      : new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);

  const daysDiff = getDateDifference(startDate, endDate);
  const monthsDiff = Math.ceil(daysDiff / 28);

  // Limit the number of ticks to MAX_TICKS
  const tickSpanInMonths = Math.ceil(monthsDiff / MAX_TICKS);

  while (currentDate.getTime() <= endDateInMilliseconds) {
    ticks.push(getUnixTime(currentDate));
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + tickSpanInMonths, 1);
  }

  return ticks;
};

const getDailyTicks = (startDate: Date, endDate: Date): number[] => {
  const ticks = [];

  const endDateInMilliseconds = endDate.getTime();
  let currentDate = startDate;

  const daysDiff = getDateDifference(startDate, endDate);

  // Limit the number of ticks to MAX_TICKS
  const tickSpanInDays = Math.ceil((daysDiff + 1) / MAX_TICKS);

  while (currentDate.getTime() <= endDateInMilliseconds) {
    ticks.push(getUnixTime(currentDate));
    currentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + tickSpanInDays,
    );
  }

  return ticks;
};

/**
 * Generates an array of ticks (timestamps) between the specified start and end dates.
 * The function calculates either daily or monthly ticks based on the date range.
 *
 * - If the range spans two or more first days of a month, monthly ticks are returned.
 * - Otherwise, daily ticks are returned.
 * - The number of ticks will not exceed 7 (if the range allows).
 *
 * @param {string} startDate - The starting date of the range in 'YYYY-MM-DD' format.
 * @param {string} endDate - The ending date of the range in 'YYYY-MM-DD' format.
 * @param {Object} [option] - Optional settings for controlling the tick generation.
 * @param {boolean} [option.skipEmptyEndTicks] - If true, the end date is adjusted based on the `lastDataPointDateTime`.
 * @param {number} [option.lastDataPointDateTime] - A timestamp for the last data point. Used when `skipEmptyEndTicks` is true.
 *
 * @returns {number[]} - An array of tick timestamps (in Unix format), with a maximum of 7 ticks.
 */
export const getTicks = (
  startDate: string,
  endDate: string,
  option?: {
    skipEmptyEndTicks?: boolean;
    lastDataPointDateTime?: number;
  },
): number[] => {
  const startDateObj = getLocalDate(startDate);

  const lastDate =
    option?.skipEmptyEndTicks && option.lastDataPointDateTime
      ? new Date(option.lastDataPointDateTime * 1000)
      : getLocalDate(endDate);

  const firstDayOfPreviousMonth = new Date(lastDate.getFullYear(), lastDate.getMonth() - 1, 1);

  // Use monthly ticks if the range includes two or more first days of a month
  if (startDateObj.getTime() <= firstDayOfPreviousMonth.getTime()) {
    return getMonthlyTicks(startDateObj, lastDate);
  }

  return getDailyTicks(startDateObj, lastDate);
};
