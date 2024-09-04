/*
 *  Copyright 2024 LiteFarm.org
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
import { useTranslation } from 'react-i18next';

// TODO: LF-4056
const supportedLanguages = [
  ['en', 'PROFILE.ACCOUNT.ENGLISH'],
  ['de', 'PROFILE.ACCOUNT.GERMAN'],
  ['es', 'PROFILE.ACCOUNT.SPANISH'],
  ['pt', 'PROFILE.ACCOUNT.PORTUGUESE'],
  ['fr', 'PROFILE.ACCOUNT.FRENCH'],
  ['hi', 'PROFILE.ACCOUNT.HINDI'],
  ['pa', 'PROFILE.ACCOUNT.PUNJABI'],
  ['ml', 'PROFILE.ACCOUNT.MALAYALAM'],
];

const useLanguageOptions = () => {
  const { t } = useTranslation();

  return supportedLanguages.map(([value, text]) => ({
    value,
    label: t(text),
  }));
};

export const languageCodes = supportedLanguages.map(([code]) => code);

export default useLanguageOptions;
