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

import { RRule, datetime } from 'rrule';
import { getRruleLanguage as getTranslations } from '../../util/rruleTranslation';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';
import { parseISOStringToLocalDate } from '../Form/Input/utils';

export const RRULEDAYS = {
  Sunday: 'SU',
  Monday: 'MO',
  Tuesday: 'TU',
  Wednesday: 'WE',
  Thursday: 'TH',
  Friday: 'FR',
  Saturday: 'SA',
};

export const getWeekday = (planStartDate) => {
  const date = new Date(parseISOStringToLocalDate(planStartDate));

  return date.toLocaleString('en', { weekday: 'long' });
};

export const getDate = (planStartDate) => {
  const date = new Date(parseISOStringToLocalDate(planStartDate));

  return date.getDate();
};

export const getLocalizedDateString = (planStartDate) => {
  const date = new Date(parseISOStringToLocalDate(planStartDate));

  return new Intl.DateTimeFormat(getLanguageFromLocalStorage(), { dateStyle: 'long' }).format(date);
};

const calculateWeekdayOrdinal = (date) => {
  const dayOfMonth = date.getDate();

  let ordinal = Math.ceil(dayOfMonth / 7);

  // Check if the day is within the last 7 days of month
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  if (dayOfMonth > lastDayOfMonth.getDate() - 7) {
    // If within last week, return -1 as the ordinal
    ordinal = -1;
  }

  return ordinal;
};

/**
 * Convert date to UTC and return it in locale date format.
 * datetime() helper from RRule creates dates in the correct format using a 1-based month.
 * @param {string} date Date in UTC. ex. '2023-12-31'
 * @returns {string} Converted date.
 *   ex. 'Sat Dec 30 2023 16:00:00 GMT-0800 (Pacific Standard Time)'
 *        which is equivalent to 'Sun, 31 Dec 2023 00:00:00 GMT'
 */
const getUTCInLocale = (date) => {
  const [year, month, day] = date.split('-');
  return new Date(datetime(year, month, day));
};

/**
 * Generate date in YYYY-MM-DD format.
 * @param {number} year ex. 2023
 * @param {number} month ex. 8
 * @param {number} day ex. 1
 * @returns {string} Date in YYYY-MM-DD format. ex. "2023-08-01"
 */
const getDateInYYYYMMDD = (year, month, day) => {
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
};

export const calculateMonthlyOptions = (planStartDate, repeatFrequency) => {
  const currentLang = getLanguageFromLocalStorage();

  const translations = getTranslations(currentLang);

  const dt = parseISOStringToLocalDate(planStartDate);
  const weekday = RRULEDAYS[dt.toLocaleString('en', { weekday: 'long' })];
  const date = dt.getDate();
  const ordinal = calculateWeekdayOrdinal(dt);

  const dateRuleOptions = getTextRuleOptions('month', planStartDate, repeatFrequency);
  const dateString = new RRule(dateRuleOptions).toText(translations.getText, translations.language);

  const dayWeekRuleOptions = getTextRuleOptions('month', planStartDate, repeatFrequency, null, {
    weekday,
    ordinal,
  });
  const dayWeekString = new RRule(dayWeekRuleOptions).toText(
    translations.getText,
    translations.language,
  );

  const options = [
    {
      value: date,
      label: dateString,
    },
    {
      value: { ordinal, weekday },
      label: dayWeekString,
    },
  ];

  // add 4th week option if planStartDate is both the 4th week of the month and the last
  if (ordinal === -1 && Math.ceil(date / 7) === 4) {
    const fourthWeekOptions = getTextRuleOptions('month', planStartDate, repeatFrequency, null, {
      weekday,
      ordinal: 4,
    });
    const fourthWeekString = new RRule(fourthWeekOptions).toText(
      translations.getText,
      translations.language,
    );
    options.splice(1, 0, { value: { ordinal: 4, weekday }, label: fourthWeekString });
  }

  return options;
};

export const countOccurrences = ({
  planStartDate,
  repeatFrequency,
  repeatInterval,
  daysOfWeek,
  monthRepeatOn,
  finishOnDate,
  origStartDate,
}) => {
  const textRuleOptions = getTextRuleOptions(
    repeatInterval.value,
    planStartDate,
    repeatFrequency,
    daysOfWeek,
    monthRepeatOn.value,
  );
  const occurencesRuleOptions = getOccurrencesRuleOptions(
    textRuleOptions,
    repeatInterval.value,
    origStartDate,
    planStartDate,
    'on',
    null,
    finishOnDate,
  );

  // new RRule().all() generates the array of occurrences
  return new RRule(occurencesRuleOptions).all().length;
};

const frequencyKeys = {
  day: 'DAILY',
  week: 'WEEKLY',
  month: 'MONTHLY',
  year: 'YEARLY',
};

/**
 * Function that returns an object that is used to create a rule (new RRule()) for generating text. *
 */
const getTextRuleOptions = (
  repeatInterval,
  startDate,
  repeatFrequency,
  daysOfWeek,
  monthRepeatOnValue,
) => {
  const options = {
    freq: RRule[frequencyKeys[repeatInterval]],
    interval: +repeatFrequency,
  };

  if (repeatInterval === 'day') {
    return options;
  }
  if (repeatInterval === 'week') {
    const [day] = daysOfWeek;
    return { ...options, byweekday: [RRule[RRULEDAYS[day]]] };
  }
  if (repeatInterval === 'month') {
    // Monthly pattern by week ordinal and day
    if (monthRepeatOnValue && isNaN(monthRepeatOnValue)) {
      const { weekday, ordinal } = monthRepeatOnValue;
      return {
        ...options,
        bymonthday: [],
        byweekday: [RRule[weekday].nth(ordinal)],
      };
    }

    // Monthly pattern by date
    const date = monthRepeatOnValue || parseISOStringToLocalDate(startDate).getDate();
    return {
      ...options,
      bymonthday: [date],
    };
  }
  if (repeatInterval === 'year') {
    const [, month, date] = startDate.split('-');
    return { ...options, bymonth: [+month], bymonthday: [+date] };
  }
};

const getOccurrencesRuleOptions = (
  textRuleOptions,
  repeatInterval,
  originalStartDate,
  startDate,
  finish,
  count,
  endDate,
) => {
  let options = { ...textRuleOptions };

  // if startDate is original date and weekday is unchanged,
  // occurrences should not include startDate
  const startDateIsOriginalDate = startDate === originalStartDate;
  let weekdayUnchanged = true;
  let adjustedStartDate = startDate;

  if (repeatInterval === 'week') {
    const originalWeekday = getWeekday(originalStartDate);
    weekdayUnchanged =
      RRule[RRULEDAYS[originalWeekday]].weekday === textRuleOptions.byweekday[0].weekday;
  }
  if (startDateIsOriginalDate && weekdayUnchanged) {
    const [year, month, day] = startDate.split('-');
    adjustedStartDate = getDateInYYYYMMDD(year, month, +day + 1);
  }
  options.dtstart = getUTCInLocale(adjustedStartDate);

  if (finish === 'on') {
    options.until = getUTCInLocale(endDate);
  } else {
    options.count = count;
  }

  if (repeatInterval === 'month' && textRuleOptions.bymonthday.length) {
    const [date] = textRuleOptions.bymonthday;
    const dayArray = [];

    // See stackoverflow.com/questions/35757778/rrule-for-repeating-monthly-on-the-31st-or-closest-day/35765662#35765662
    if (date > 28) {
      for (let i = 28; i <= date; i++) {
        dayArray.push(i); // e.g. [28, 29, 30]
      }
    } else {
      dayArray.push(date);
    }

    options = { ...options, bymonthday: dayArray, bysetpos: -1 };
  } else if (repeatInterval === 'year' && startDate.includes('02-29')) {
    options = { ...options, bymonthday: [28, 29], bysetpos: -1 };
  }

  return options;
};

export const getTextAndOccurrences = (
  repeatInterval,
  originalStartDate,
  startDate,
  repeatFrequency,
  finish,
  count,
  endDate,
  daysOfWeek,
  monthRepeatOn,
) => {
  const textRuleOptions = getTextRuleOptions(
    repeatInterval,
    startDate,
    repeatFrequency,
    daysOfWeek,
    monthRepeatOn,
  );

  const occurrencesRuleOptions = getOccurrencesRuleOptions(
    textRuleOptions,
    repeatInterval,
    originalStartDate,
    startDate,
    finish,
    count,
    endDate,
  );

  const currentLang = getLanguageFromLocalStorage();
  const { getText, language } = getTranslations(currentLang);

  return {
    text: new RRule(textRuleOptions).toText(getText, language),
    occurrences: new RRule(occurrencesRuleOptions).all().map((date) => {
      const d = new Date(date);
      return getDateInYYYYMMDD(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
    }),
  };
};
