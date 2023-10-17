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
 * Calculates the start and end dates of the week containing the given date.
 *
 * @param {Date} Date The date for which to calculate the week's start and end dates.
 * @param {string} weekStartDay "Sunday" or "Monday" - a day that should be considered as the week start day.
 * @returns {{ startDate: string, endDate: string }} - An object containing the start and end dates of the week in the "YYYY-MM-DD" format.
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

export function getStartAndEndDateOfYearToDate(date) {
  const startDate = new Date(date.getFullYear(), 0, 1);

  return {
    startDate: getLocalDateInYYYYDDMM(startDate),
    endDate: getLocalDateInYYYYDDMM(date),
  };
}

export default class DateRange {
  constructor(date = new Date(), weekStartDay = SUNDAY) {
    this.baseDate = date;
    this.weekStartDay = [SUNDAY, MONDAY].includes(weekStartDay) ? weekStartDay : SUNDAY;
  }

  getLastDaysOptionDateRange(days) {
    return {
      startDate: getLocalDateInYYYYDDMM(addDaysToDate(this.baseDate, -days)),
      endDate: getLocalDateInYYYYDDMM(this.baseDate),
    };
  }

  getLastWeekDateRange() {
    const lastWeekDate = addDaysToDate(this.baseDate, -7);
    return getStartAndEndDateOfWeek(lastWeekDate, this.weekStartDay);
  }

  getLastMonthDateRange() {
    const lastMonthDate = new Date(this.baseDate.getFullYear(), this.baseDate.getMonth() - 1, 1);
    return getStartAndEndDateOfMonth(lastMonthDate);
  }

  getDates(range) {
    return {
      [options.YEAR_TO_DATE]: () => getStartAndEndDateOfYearToDate(this.baseDate),
      [options.LAST_7_DAYS]: () => this.getLastDaysOptionDateRange(6),
      [options.LAST_14_DAYS]: () => this.getLastDaysOptionDateRange(13),
      [options.LAST_30_DAYS]: () => this.getLastDaysOptionDateRange(29),
      [options.THIS_WEEK]: () => getStartAndEndDateOfWeek(this.baseDate, this.weekStartDay),
      [options.LAST_WEEK]: () => this.getLastWeekDateRange(),
      [options.THIS_MONTH]: () => getStartAndEndDateOfMonth(this.baseDate),
      [options.LAST_MONTH]: () => this.getLastMonthDateRange(),
      [options.CUSTOM]: () => ({ startDate: '', endDate: '' }),
    }[range]();
  }
}
