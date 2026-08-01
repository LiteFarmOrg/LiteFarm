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

/**
 * Formats a date-only value as YYYY-MM-DD.
 *
 * node-pg returns Postgres `date` columns as Date objects set to *local* midnight, so the
 * calendar day is read from the local components. toISOString() would report the previous
 * day whenever the server runs east of UTC.
 *
 * @param value - A Date from a Postgres `date` column, or a string beginning with YYYY-MM-DD.
 * @returns - The calendar day as YYYY-MM-DD.
 */
export function formatDateOnly(value: Date | string): string {
  if (typeof value === 'string') {
    return value.split('T')[0];
  }
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${value.getFullYear()}-${month}-${day}`;
}

/**
 * Adds a specified number of days to a given date.
 *
 * @param date - The initial date to which days should be added. ex. new Date(2023, 10, 1)
 * @param days - The number of days to add to the initial date. (Could be a negative number)
 * @returns - A new Date object representing the result of adding the specified days to the initial date.
 */
export function addDaysToDate(date: Date, days: number): Date {
  const newDate = new Date(date.getTime());
  return new Date(newDate.setDate(newDate.getDate() + days));
}

/**
 * Sets a specified date to midnight or 00:00.000.
 *
 * @param date - The initial date to which the hours will be set
 * @returns - A new Date object representing the result of setting the date to midnight.
 */
export function getStartOfDate(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

/**
 * Sets a specified date to 1 millisecond before midnight.
 *
 * @param date - The initial date to which the hours will be set
 * @returns - A new Date object representing the result of setting the date to 1 millisecond before midnight.
 */
export function getEndOfDate(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
}
