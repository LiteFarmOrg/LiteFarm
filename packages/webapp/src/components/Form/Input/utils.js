import i18n from '../../../locales/i18n';

export const isNotInFuture = (data) => {
  return new Date(data) <= new Date()
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
