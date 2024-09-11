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
