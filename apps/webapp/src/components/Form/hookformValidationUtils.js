import i18n from '../../locales/i18n';

export const hookFormMaxValidation = (max = 9999) => ({
  value: max,
  message: i18n.t('common:MAX_ERROR', { value: max }),
});
export const hookFormMinValidation = (min) => ({
  value: min,
  message: i18n.t('common:MIN_ERROR', { value: min }),
});
export const hookFormMaxLengthValidation = (length = 60) => ({
  value: length,
  message: i18n.t('common:WORD_LIMIT_ERROR', { value: length }),
});
