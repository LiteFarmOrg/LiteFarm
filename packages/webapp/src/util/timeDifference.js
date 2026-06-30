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
import i18n from '../locales/i18n';

export const timeDifference = (current, previous) => {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return i18n.t('translation:SENSOR.SECONDS_AGO', { time: Math.round(elapsed / 1000) });
  } else if (elapsed < msPerHour) {
    return i18n.t('translation:SENSOR.MINUTES_AGO', { time: Math.round(elapsed / msPerMinute) });
  } else if (elapsed < msPerDay) {
    return i18n.t('translation:SENSOR.HOURS_AGO', { time: Math.round(elapsed / msPerHour) });
  } else if (elapsed < msPerMonth) {
    return i18n.t('translation:SENSOR.DAYS_AGO', { time: Math.round(elapsed / msPerDay) });
  } else if (elapsed < msPerYear) {
    return i18n.t('translation:SENSOR.MONTHS_AGO', { time: Math.round(elapsed / msPerMonth) });
  } else {
    return '';
  }
};
