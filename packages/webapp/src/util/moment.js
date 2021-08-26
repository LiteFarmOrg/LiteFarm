import moment from 'moment';
import { getLanguageFromLocalStorage } from './getLanguageFromLocalStorage';

/**
 *
 * @param date
 * @return {string}
 */
export const getDateInputFormat = (date) => moment(date).utc().format('YYYY-MM-DD');

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

export const addDaysToDate = (date, days) => {
  return moment(date).add(days, 'days').utc().format('YYYY-MM-DD');
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
export const getShortLocalizedDateString = (date) =>
  moment(date).locale(getLanguageFromLocalStorage()).format(`MMM DD,'YY`);

export const getManagementPlanTileDate = (date) =>
  moment(date).locale(getLanguageFromLocalStorage()).utc().format(`MMM DD,'YY`);

export const getTaskCardDate = (date) =>
  moment(date).locale(getLanguageFromLocalStorage()).utc().format('MMM D, YYYY');
