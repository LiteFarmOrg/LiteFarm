import i18n from '../../../locales/i18n';

/* @param {string} dateString - a date string to parse to local time
 * @returns {Date}
 */
const parseISOStringToLocalDate = (dateString) => {
  if (dateString.endsWith('z') || dateString.endsWith('Z')) {
    // this string should be parsed in UTC and then converted to local time
    return new Intl.DateTimeFormat().format(new Date(dateString));
  }
  // this string does not specify to parse in UTC, so we should parse properly ourselves
  // note: by default, new Date(string) and Date.parse(String) WILL parse in UTC
  const split = dateString.replace(/[zZ]$/).split(/\D/);
  return new Date(split[0], split[1] - 1, ...split.slice(2));
};

export const isNotInFuture = (data) => {
  // new Date() is in local time, so we need to ensure that we parse the date in local time
  return parseISOStringToLocalDate(data) <= new Date()
    ? true
    : i18n.t('MANAGEMENT_PLAN.COMPLETE_PLAN.FUTURE_DATE_INVALID');
};

export const isValidName = (name) => {
  const nameSplit = name.split(/ (.+)/);
  const firstName = nameSplit.length > 0 ? nameSplit[0] : '';
  const lastName = nameSplit.length > 1 ? nameSplit[1] : '';
  if (firstName.length > 255 && lastName.length > 255) {
    return (
      i18n.t('PROFILE.ERROR.FIRST_NAME_LENGTH') + ', ' + i18n.t('PROFILE.ERROR.LAST_NAME_LENGTH')
    );
  } else if (lastName.length > 255) {
    return i18n.t('PROFILE.ERROR.LAST_NAME_LENGTH');
  } else if (firstName.length > 255) {
    return i18n.t('PROFILE.ERROR.FIRST_NAME_LENGTH');
  } else {
    return true;
  }
};
