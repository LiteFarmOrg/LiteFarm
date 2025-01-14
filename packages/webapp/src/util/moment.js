/*
 *  Copyright 2021-2024 LiteFarm.org
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

import moment from 'moment';
import { getLanguageFromLocalStorage } from './getLanguageFromLocalStorage';

/**
 *
 * @param date
 * @return {string}
 */
export const getDateInputFormat = (date) => moment(date).format('YYYY-MM-DD');

/**
 *
 *
 * @param date
 * @return {Moment}
 */
export const getDateUTC = (date) => moment(date).utc();

/**
 *
 * @param pastDate
 * @param futureDate
 * @return {number}
 */
export const getDateDifference = (pastDate, futureDate) => {
  return moment(futureDate).diff(moment(pastDate), 'days');
};

/**
 *
 * @param date
 * @param days {number}
 * @return {string}
 */

export const addDaysToDate = (date, days, { toUTC = true } = {}) => {
  return toUTC
    ? moment(date).add(days, 'days').utc().format('YYYY-MM-DD')
    : moment(date).add(days, 'days').format('YYYY-MM-DD');
};
/**
 *
 * @param {string|Date} date - The date to format, either as a string or a Date object.
 * @param {Object} the Intl.DateTimeFormat options object.
 * @return {string} The formatted date string, or 'Invalid date' if the input date is invalid
 Default format: September 14, 2024 or as appropriate to language */
export const getLocalizedDateString = (date, options = { dateStyle: 'long' }) => {
  const language = getLanguageFromLocalStorage();
  const parsedDate = moment(date);

  if (!parsedDate.isValid()) {
    return 'Invalid date';
  }

  return new Intl.DateTimeFormat(language, options).format(parsedDate.toDate());
};

export const getManagementPlanCardDate = (date) =>
  getLocalizedDateString(date, { month: 'short', day: '2-digit', year: '2-digit' });

export const getManagementPlanTileDate = (date) =>
  getLocalizedDateString(date, { month: 'short', day: '2-digit', year: '2-digit' });

export const getTaskCardDate = (date) => moment(date).format('MMM D, YYYY');

export const getNotificationCardDate = (date) =>
  getLocalizedDateString(date, { month: '2-digit', day: '2-digit', year: '2-digit' });

export const getCurrentDateLong = (date) => moment().format('L');

/**
 * Converts a date string to an ISO string with local timezone, safe to store and retrive from the database.
 *
 * @param {string} dateString - The date string to convert, e.g. the date string from a date picker.
 * @returns {string} The converted ISO string with local timezone, e.g. "2024-03-12T00:00:00.000-07:00" (= midnight PST on March 12, 2024)
 */
export function toLocalISOString(dateString) {
  const date = moment(dateString);
  return date.format('YYYY-MM-DD[T00:00:00.000]Z');
}
