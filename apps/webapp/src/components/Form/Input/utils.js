import i18n from '../../../locales/i18n';

/* @param {string} dateString - a date string to parse to local time
 * @returns {Date}
 */
export const parseISOStringToLocalDate = (dateString) => {
  const offsetPattern = /([+-]\d{2}|Z):?(\d{2})?\s*$/;
  if (offsetPattern.test(dateString.slice(19))) {
    // this string can be parsed normally as it has a specified offset, and then formatted into local time
    return new Intl.DateTimeFormat().format(new Date(dateString));
  }
  // this string does not have a specified offset, so we should treat it as if it is in local time
  // note: by default, new Date(string) and Date.parse(String) WILL parse in UTC
  const split = dateString.split(/\D/);
  return new Date(split[0], split[1] - 1, ...split.slice(2));
};

export const isNotInFuture = (data) => {
  // Do not compare if no date has been given. If the date is required, specify that in register
  if (data === '') {
    return true;
  }

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
