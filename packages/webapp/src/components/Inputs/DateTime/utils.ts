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
 * This function uses the `Intl.DateTimeFormat` API to determine the date and time formats for a given locale (or by default, browser locale). It generates format strings that can be used with the MUI X date/time pickers.
 *
 * By doing this, we can mimic the look of native date/time pickers, even though in our case we are using MUI pickers and setting format manually.
 *
 * @param locale - The locale to get formats for (e.g., 'en-US', 'de', 'fr-CA'); defaults to the browser's language
 * @returns Object containing date and time format strings
 */
export const getLocaleDateTimeFormats = (locale: string = navigator.language) => {
  try {
    const dateSample = new Date(2025, 4, 14);
    const dateParts = new Intl.DateTimeFormat(locale).formatToParts(dateSample);

    const timeSample = new Date(2025, 3, 25, 15, 20);
    const timeParts = new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: 'numeric',
      hour12: undefined, // Let locale determine 12/24 hour format
    }).formatToParts(timeSample);

    const uses12HourFormat = timeParts.some((part) => part.type === 'dayPeriod');

    const dateFormat = dateParts
      .map(({ type, value }) => {
        switch (type) {
          case 'day':
            return 'DD';
          case 'month':
            return 'MM';
          case 'year':
            return 'YYYY';
          case 'literal':
            return value;
          default:
            return '';
        }
      })
      .join('');

    const timeFormat = timeParts
      .map(({ type, value }) => {
        switch (type) {
          case 'hour':
            return uses12HourFormat ? 'hh' : 'HH';
          case 'minute':
            return 'mm';
          case 'dayPeriod':
            return 'A';
          case 'literal':
            return value;
          default:
            return '';
        }
      })
      .join('');

    return { dateFormat, timeFormat, uses12HourFormat };
  } catch (error) {
    console.error('Error generating date/time formats:', error);

    return { dateFormat: 'YYYY-MM-DD', timeFormat: 'HH:mm', uses12HourFormat: false };
  }
};
