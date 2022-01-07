const i18n = require('./i18n');

module.exports = {
  tCrop: (crop_translation_key) =>
    i18n.t(`crop.${crop_translation_key}`, { defaultValue: crop_translation_key }),
  i18n,
  t: i18n.t,
};
