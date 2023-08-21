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
 * @param date{string}
 * @return {string}
 */
export const getDateFromDateTimeString = (date) => date.split('T')[0];

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
 * @param date
 * @return {string}
 */
export const getLocalizedDateString = (date, format = 'MMMM DD, YYYY') =>
  moment(date).locale(getLanguageFromLocalStorage()).format(format);

/**
 *
 * @param date
 * @returns {string}
 */
export const getManagementPlanCardDate = (date) =>
  moment(date).locale(getLanguageFromLocalStorage()).format(`MMM DD,'YY`);

export const getManagementPlanTileDate = (date) =>
  moment(date).locale(getLanguageFromLocalStorage()).format(`MMM DD,'YY`);

export const getTaskCardDate = (date) =>
  moment(date).locale(getLanguageFromLocalStorage()).format('MMM D, YYYY');

export const getNotificationCardDate = (date) =>
  moment(date).locale(getLanguageFromLocalStorage()).format('MM/DD/YY');

export const getCurrentDateLong = (date) => moment().format('L');
