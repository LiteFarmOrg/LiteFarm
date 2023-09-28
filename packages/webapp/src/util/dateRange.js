/*
 *  Copyright 2023 LiteFarm.org
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
import { addDaysToDate, getLocalDateInYYYYDDMM } from './date';
import { dateRangeOptions as options } from '../components/DateRangeSelector/constants';

export const SUNDAY = 'Sunday';
export const MONDAY = 'Monday';
export const SATURDAY = 'Saturday';

export const weekdayNumbers = {
  [SUNDAY]: 0,
  [MONDAY]: 1,
  [SATURDAY]: 6,
};

/**
 * Returns startDate and endDate of the week of the given date.
 * If weekStartDay is Monday, Sunday's day number is adjusted to 7 for the calculation like below.
 *
 * Starting with Monday
 * | M | T | W | T | F | S | S |
 * | - | - | - | - | - | - | - |
 * | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
 *
 * @typedef {object} StartEndDates
 * @property {string} startDate - date in YYYY-MM-DD format
 * @property {string} endDate - date in YYYY-MM-DD format
 *
 * @param {date} Date ex. new Date(2023, 10, 1)
 * @param {string} weekStartDay "Sunday" or "Monday"
 * @returns {StartEndDates}
 */
export function getStartAndEndDateOfWeek(date, weekStartDay) {
  const weekDayNumber = date.getDay();
  const isDateSunday = weekDayNumber === 0;

  // use "7" for Sunday instead of "0" if weekStartDay is Monday
  const adjustedWeekDayNumber = weekStartDay === MONDAY && isDateSunday ? 7 : weekDayNumber;
  const adjustedWeekEndDayNumber = weekStartDay === MONDAY ? 7 : weekdayNumbers[SATURDAY];

  const daysFromStartDate = adjustedWeekDayNumber - weekdayNumbers[weekStartDay];
  const daysToEndDate = adjustedWeekEndDayNumber - adjustedWeekDayNumber;

  return {
    startDate: getLocalDateInYYYYDDMM(addDaysToDate(date, -daysFromStartDate)),
    endDate: getLocalDateInYYYYDDMM(addDaysToDate(date, daysToEndDate)),
  };
}

export function getStartAndEndDateOfMonth(date) {
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return {
    startDate: getLocalDateInYYYYDDMM(startDate),
    endDate: getLocalDateInYYYYDDMM(endDate),
  };
}

export function getStartAndEndDateOfYear(date) {
  const startDate = new Date(date.getFullYear(), 0, 1);
  const endDate = new Date(date.getFullYear(), 11, 31);

  return {
    startDate: getLocalDateInYYYYDDMM(startDate),
    endDate: getLocalDateInYYYYDDMM(endDate),
  };
}

export default class DateRange {
  constructor(date = new Date(), weekStartDay = SUNDAY) {
    this.baseDate = date;
    this.weekStartDay = [SUNDAY, MONDAY].includes(weekStartDay) ? weekStartDay : SUNDAY;
  }

  getDates(range) {
    if (range === options.THIS_YEAR) {
      return getStartAndEndDateOfYear(this.baseDate);
    }
    if (range === options.LAST_7_DAYS) {
      return {
        startDate: getLocalDateInYYYYDDMM(addDaysToDate(this.baseDate, -6)),
        endDate: getLocalDateInYYYYDDMM(this.baseDate),
      };
    }
    if (range === options.LAST_14_DAYS) {
      return {
        startDate: getLocalDateInYYYYDDMM(addDaysToDate(this.baseDate, -13)),
        endDate: getLocalDateInYYYYDDMM(this.baseDate),
      };
    }
    if (range === options.LAST_30_DAYS) {
      return {
        startDate: getLocalDateInYYYYDDMM(addDaysToDate(this.baseDate, -29)),
        endDate: getLocalDateInYYYYDDMM(this.baseDate),
      };
    }
    if (range === options.THIS_WEEK) {
      return getStartAndEndDateOfWeek(this.baseDate, this.weekStartDay);
    }
    if (range === options.LAST_WEEK) {
      const lastWeekDate = addDaysToDate(this.baseDate, -7);
      return getStartAndEndDateOfWeek(lastWeekDate, this.weekStartDay);
    }
    if (range === options.THIS_MONTH) {
      return getStartAndEndDateOfMonth(this.baseDate);
    }
    if (range === options.LAST_MONTH) {
      const lastMonthDate = new Date(this.baseDate.getFullYear(), this.baseDate.getMonth() - 1, 1);
      return getStartAndEndDateOfMonth(lastMonthDate);
    }
    if (range === options.CUSTOM) {
      return { startDate: '', endDate: '' };
    }
  }
}
