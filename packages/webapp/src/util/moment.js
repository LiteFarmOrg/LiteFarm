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
export const getLocalizedDateString = (date) =>
  moment(date).locale(getLanguageFromLocalStorage()).format('MMMM DD, YYYY');
/**
 *
 * @param date
 * @returns {string}
 */
export const getShortLocalizedDateString = (date) =>
  moment(date).locale(getLanguageFromLocalStorage()).format(`MMM DD,'YY`);
