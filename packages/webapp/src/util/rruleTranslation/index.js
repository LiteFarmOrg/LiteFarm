/*
 *  Copyright 2023, 2024 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

// Import all translation files directly not dynamically
const languageJsonFiles = import.meta.glob('../../locales/*/rrule.json', { eager: true });

// TODO: Use reusable value specified in i18n
const supportedLanguages = ['fr', 'pt', 'es'];
let translationJson;

const getLanguage = (language) => {
  const { getText, dayNames, monthNames } = language;
  return {
    getText: (id) => getText[id] || id,
    language: {
      dayNames: dayNames,
      monthNames: monthNames,
    },
  };
};

export const getRruleLanguage = (language) => {
  if (!supportedLanguages.includes(language)) {
    return { getText: (id) => id, language: null };
  }
  translationJson = languageJsonFiles[`../../locales/${language}/rrule.json`];
  return getLanguage(translationJson);
};
