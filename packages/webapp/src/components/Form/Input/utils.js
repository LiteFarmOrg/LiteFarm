import i18n from '../../../locales/i18n';

export const isNotInFuture = (data) => {
  return new Date(data) <= new Date()
    ? true
    : i18n.t('MANAGEMENT_PLAN.COMPLETE_PLAN.FUTURE_DATE_INVALID');
};
