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

/**
 * Function that formats date to include day of week.
 * @param {string} date Date to format. ex. '2023-12-31'
 * @param {string} language User's preferred language. ex. 'en', 'es', 'fr', 'pt'
 * @returns {string} Formatted date. ex. 'Sunday, December 31, 2023'
 */
export const getDateWithDayOfWeek = (date, language = 'en') => {
  const [year, month, day] = date.split('-');
  return new Intl.DateTimeFormat(language, { dateStyle: 'full' }).format(
    new Date(year, month - 1, day),
  );
};

/**
 * Generate date in YYYY-MM-DD format.
 * @param {number} year ex. 2023
 * @param {number} month ex. 8
 * @param {number} day ex. 1
 * @returns {string} Date in YYYY-MM-DD format. ex. "2023-08-01"
 */
export const getDateInYYYYMMDD = (year, month, day) => {
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
};

/**
 * Generate local date in YYYY-MM-DD format from a Date object.
 * @param {date} Date ex. new Date(2023, 8, 1)
 * @returns {string} Date in YYYY-MM-DD format. ex. "2023-09-01"
 */
export const getLocalDateInYYYYDDMM = (date = new Date()) => {
  const [year, month, day] = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
  return getDateInYYYYMMDD(year, month, day);
};

/**
 * Returns a date that the given days is added to the given date.
 * @param {date} Date ex. new Date(2023, 10, 1)
 * @param {number} days days to add. Could be a negative number.
 * @returns {string} Date
 */
export function addDaysToDate(date, days) {
  const newDate = new Date(date.getTime());
  return new Date(newDate.setDate(newDate.getDate() + days));
}
