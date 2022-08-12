import i18n from './i18n.js';

const tCrop = (crop_translation_key) =>
  i18n.t(`crop:${crop_translation_key}`, { defaultValue: crop_translation_key });

const { t } = i18n;

export { tCrop, t, i18n };
