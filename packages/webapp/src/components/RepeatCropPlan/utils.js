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

import { RRule } from 'rrule';
import { getRruleLanguage } from '../../util/rruleTranslation';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';
import { parseISOStringToLocalDate } from '../Form/Input/utils';

const RRULEDAYS = {
  Sunday: 'SU',
  Monday: 'MO',
  Tuesday: 'TU',
  Wednesday: 'WE',
  Thursday: 'TH',
  Friday: 'FR',
  Saturday: 'SA',
};

const translationCache = {};

// Returns rrule language definition if already imported, otherwise loads and saves it to memory
const getTranslations = async (lang) => {
  if (translationCache[lang]) {
    return translationCache[lang];
  }
  const translation = await getRruleLanguage(lang);
  translationCache[lang] = translation;
  return translation;
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

export const calculateMonthlyOptions = async (planStartDate, repeatFrequency) => {
  const currentLang = getLanguageFromLocalStorage();

  const translations = await getTranslations(currentLang);

  const dt = parseISOStringToLocalDate(planStartDate);
  const weekday = RRULEDAYS[dt.toLocaleString('en', { weekday: 'long' })];
  const date = dt.getDate();
  const ordinal = calculateWeekdayOrdinal(dt);

  const dateRule = new RRule({
    freq: RRule.MONTHLY,
    dtstart: dt,
    bymonthday: [date],
    interval: Number(repeatFrequency),
  });

  const dateString = dateRule.toText(translations.getText, translations.language);

  const dayWeekRule = new RRule({
    freq: RRule.MONTHLY,
    dtstart: dt,
    bymonthday: [],
    byweekday: [RRule[weekday].nth(ordinal)],
    interval: Number(repeatFrequency),
  });

  const dayWeekString = dayWeekRule.toText(translations.getText, translations.language);

  return [
    {
      value: date,
      label: dateString,
    },
    {
      value: { ordinal, weekday },
      label: dayWeekString,
    },
  ];
};

export const countOccurrences = ({
  planStartDate,
  repeatFrequency,
  repeatInterval,
  daysOfWeek,
  monthRepeatOn,
  finishOnDate,
}) => {
  const dtStart = parseISOStringToLocalDate(planStartDate);
  const dtEnd = parseISOStringToLocalDate(finishOnDate);

  let rule;

  if (repeatInterval.value === 'day') {
    rule = new RRule({
      freq: RRule.DAILY,
      dtstart: dtStart,
      interval: Number(repeatFrequency),
      until: dtEnd,
    });
  } else if (repeatInterval.value === 'week') {
    const [day] = daysOfWeek;

    rule = new RRule({
      freq: RRule.WEEKLY,
      dtstart: dtStart,
      byweekday: [RRule[RRULEDAYS[day]]],
      interval: Number(repeatFrequency),
      until: dtEnd,
    });

    // Monthly pattern by week ordinal and day
  } else if (repeatInterval.value === 'month' && isNaN(monthRepeatOn.value)) {
    const pattern = monthRepeatOn.value;
    rule = new RRule({
      freq: RRule.MONTHLY,
      dtstart: dtStart,
      bymonthday: [],
      byweekday: [RRule[pattern.weekday].nth(pattern.ordinal)],
      interval: Number(repeatFrequency),
      until: dtEnd,
    });

    // Monthly pattern by date
  } else if (repeatInterval.value === 'month') {
    const date = monthRepeatOn.value;
    const dayArray = [];

    // See stackoverflow.com/questions/35757778/rrule-for-repeating-monthly-on-the-31st-or-closest-day/35765662#35765662
    if (date > 28) {
      for (let i = 28; i <= date; i++) {
        dayArray.push(i); // e.g. [28, 29, 30]
      }
    } else {
      dayArray.push(date);
    }

    rule = new RRule({
      freq: RRule.MONTHLY,
      dtstart: dtStart,
      bymonthday: dayArray,
      bysetpos: -1,
      interval: repeatFrequency,
      until: dtEnd,
    });
  } else if (repeatInterval.value === 'year') {
    rule = new RRule({
      freq: RRule.YEARLY,
      dtstart: dtStart,
      interval: repeatFrequency,
      until: dtEnd,
    });
  }

  // rule.all() generates the array of occurrences
  return rule.all().length;
};
