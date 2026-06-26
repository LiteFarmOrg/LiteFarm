/*
 *  Copyright 2026 LiteFarm.org
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

import { ComponentType } from 'react';
import tape_survey from '../../../assets/images/insights/tape_survey.svg';
import TapeResults from './TapeResults';
import ThankYouResults from './ThankYouResults';

interface SurveyInfo {
  image: string;
  ResultsComponent?: ComponentType<{ surveyId: string }>;
  // CDN directory under DO_CDN_URL holding the survey's `<version>.json` definitions.
  cdnDirectory: string;
  // Uppercase ISO-2 country code -> CDN version to load. The 'default' key is the global fallback;
  // a survey with no 'default' is available only in the countries it lists explicitly.
  versionsByCountry: Record<string, string>;
}

/**
 * The catalog of surveys, keyed by survey `key` (the same string stored in survey_response.survey_key).
 * This is the single source of truth for the frontend: which surveys exist, the tile image and
 * results component, the CDN directory, and the per-country version/availability. The database holds
 * only the responses.
 *
 * Adding a survey:
 *  1. Add a SURVEY_INFO entry here: image, ResultsComponent (omit for the generic thank-you page),
 *     cdnDirectory, versionsByCountry.
 *  2. Add the title in useSurveyTitle.ts as a literal call: surveyKey: t('INSIGHTS.<KEY>.TITLE').
 *  3. Add that title string to public/locales/en/translation.json (English only; Crowdin propagates).
 *  4. Upload the survey's <version>.json to its CDN directory.
 */
export const SURVEY_INFO: Record<string, SurveyInfo> = {
  tape: {
    image: tape_survey,
    ResultsComponent: TapeResults,
    cdnDirectory: 'tape_surveys',
    versionsByCountry: { default: 'fao', AU: 'au' },
  },
  cathi_gao: {
    image: tape_survey,
    cdnDirectory: 'idems_surveys',
    versionsByCountry: { NE: 'cathi_gao' }, // Niger only research project
  },
};

/**
 * The CDN version of a survey for a given country, or undefined when the survey does not exist or is
 * not available in that country. A country-specific entry wins over the global 'default'.
 */
export const getSurveyVersion = (surveyId: string, countryCode?: string): string | undefined => {
  const info = SURVEY_INFO[surveyId];
  if (!info) {
    return undefined;
  }
  return (countryCode && info.versionsByCountry[countryCode]) ?? info.versionsByCountry.default;
};

/**
 * The survey ids available to a farm in the given country: those with a country-specific or global
 * version. Drives the Insights tile list.
 */
export const getAvailableSurveyIds = (countryCode?: string): string[] =>
  Object.keys(SURVEY_INFO).filter(
    (surveyId) => getSurveyVersion(surveyId, countryCode) !== undefined,
  );

/**
 * The results component for a survey, defaulting to the generic thank-you page when the survey
 * defines none.
 */
export const getResultsComponent = (surveyId: string): ComponentType<{ surveyId: string }> =>
  SURVEY_INFO[surveyId]?.ResultsComponent ?? ThankYouResults;

/**
 * Whether a survey shows its own results page rather than the generic thank-you confirmation.
 * Drives the completed-status wording on the Insights tile.
 */
export const surveyHasResultsPage = (surveyId: string): boolean =>
  getResultsComponent(surveyId) !== ThankYouResults;
