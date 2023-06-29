/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
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
import countryModel from '../models/countryModel.js';

const translationFiles = {
  es: 'react-phone-number-input/locale/es',
  fr: 'react-phone-number-input/locale/fr',
  pt: 'react-phone-number-input/locale/pt',
};

const getCountriesTranslation = async (language) => {
  if (!['es', 'fr', 'pt'].includes(language)) {
    return;
  }
  return await import(translationFiles[language]).then((labels) => labels.default);
};

const countryController = {
  /**
   * Returns "id", "country_code" and "country_name". If the language is "en", "country_name" is
   * retrieved from the db. For other languages, translation files in the library are used.
   */
  async getCountryCodesAndNames(req, res) {
    const supportedLanguages = ['en', 'es', 'fr', 'pt'];
    const language = supportedLanguages.includes(req.params.language) ? req.params.language : 'en';
    const inEnglish = language === 'en';

    try {
      const columns = ['id', 'country_code'];
      if (inEnglish) {
        columns.push('country_name');
      }
      const result = await countryModel.getCountries(columns);

      if (!inEnglish) {
        const labels = await getCountriesTranslation(language);
        result.forEach((row) => {
          row['country_name'] = labels[row.country_code];
        });
      }
      return res.status(200).send(result);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error });
    }
  },
};

export default countryController;
