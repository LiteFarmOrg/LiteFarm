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
 *  2. Add the title in useSurveyTitle.ts by calling t() with the key INSIGHTS.<KEY>.TITLE.
 *  3. Add that title string to public/locales/en/translation.json (English only; Crowdin propagates).
 *  4. Upload the survey's <version>.json to its CDN directory.
 */
export const SURVEY_INFO: Record<string, SurveyInfo> = {
  tape: {
    image: tape_survey,
    ResultsComponent: TapeResults,
    cdnDirectory: 'tape_surveys',
    versionsByCountry: { default: 'fao/step0_step1', AU: 'au' },
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
 * Pull the survey_version from the survey JSON. Used to invalidate drafts when survey version changes
 */
export const getSurveyDefinitionVersion = (surveyJson: any): string | undefined => {
  const expression = surveyJson?.calculatedValues?.find(
    (calculatedValue: { name?: string }) => calculatedValue.name === 'survey_version',
  )?.expression;

  if (typeof expression !== 'string') {
    return undefined;
  }
  return expression.replace(/^'(.*)'$/, '$1');
};

export const TAPE_NEW_SCHEMA_MARKER = 'location1';

const hasQuestionNamed = (surveyJson: Record<string, any>, name: string): boolean => {
  const search = (node: any): boolean => {
    if (Array.isArray(node)) {
      return node.some(search);
    }
    if (!node || typeof node !== 'object') {
      return false;
    }
    if (node.name === name && node.type) {
      return true;
    }
    return Object.values(node).some(search);
  };

  return search(surveyJson.pages);
};

export const isUpdatedTapeSchema = (surveyJson: Record<string, any> | undefined): boolean =>
  !!surveyJson && hasQuestionNamed(surveyJson, TAPE_NEW_SCHEMA_MARKER);

interface CheckDraftStaleParams {
  surveyJson: Record<string, any> | undefined;
  hasDraftData: boolean;
  draftDefinitionVersion: string | undefined;
  definitionVersion: string | undefined;
}

/**
 * Determines if an existing in-progress survey draft is stale and must be discarded.
 *
 * For legacy drafts created prior to version tracking, draftDefinitionVersion will be undefined
 *  - If the schema is TAPE V2, discard the draft
 *  - For other surveys (e.g. AU TAPE), preserve, populating definitionVersion on the next edit
 */
export const isSurveyDraftStale = ({
  surveyJson,
  hasDraftData,
  draftDefinitionVersion,
  definitionVersion,
}: CheckDraftStaleParams): boolean => {
  if (!surveyJson || !hasDraftData || draftDefinitionVersion === definitionVersion) {
    return false;
  }

  // If draft version is defined, any mismatch indicates a true update
  if (draftDefinitionVersion !== undefined) {
    return true;
  }

  // Legacy transition: invalidate unversioned drafts only when migrating to FAO TAPE v2
  return isUpdatedTapeSchema(surveyJson);
};

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
