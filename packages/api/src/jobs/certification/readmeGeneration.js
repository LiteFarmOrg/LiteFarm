const fs = require('fs').promises;
const { t } = require('../locales/i18nt');

/**
 * Adds an instructions file in a specified language to a specified export.
 *
 * @param {uuid} exportId - The specified export.
 * @param {string} {locale=en} - The specified language code.
 * @returns {Promise} A promise representing a file copy operation.
 */
module.exports = (exportId, locale = 'en') => {
  const fileName = t('EXPORT_README_TITLE');

  return fs.copyFile(`src/jobs/locales/${locale}/readme.pdf`,
    `${process.env.EXPORT_WD}/temp/${exportId}/${fileName}.pdf`);
};
