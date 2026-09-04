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
  image?: string;
  ResultsComponent?: ComponentType<{ surveyId: string }>;
  // CDN directory under DO_CDN_URL holding the survey's file(s), optionally nested under a per-language
  // subfolder (see resolveVersion below).
  cdnDirectory: string;
  // Uppercase ISO-2 country code -> CDN version to load. The 'default' key is the global fallback;
  // a survey with no 'default' is available only in the countries it lists explicitly.
  versionsByCountry: Record<string, string>;
  // Called only for the survey's 'default' version. Resolves the version to request for a language,
  // plus a fallbackVersion for the untranslated default if that's missing. Omit if the default version
  // has no per-language content (e.g. cathi_gao).
  resolveVersion?: (
    defaultVersion: string,
    language: string,
  ) => { version: string; fallbackVersion?: string };
  parentSurveyId?: string;
  isAvailable?: (parentResponse: Record<string, any>) => boolean;
  scoreField?: string;
  pages?: number;
  estimatedMinutes?: number;
}

const resolveFaoVersion = (defaultVersion: string, language: string) =>
  language === 'en'
    ? { version: `fao/${defaultVersion}` }
    : {
        version: `fao_${language}/${defaultVersion}_${language}`,
        fallbackVersion: `fao/${defaultVersion}`,
      };

const UNKNOWN_COUNT = -99;

const toHouseholdCount = (value: unknown): number => {
  // Current JSONs lack inputType: number on these questions and return a string
  const numeric = typeof value === 'string' ? Number(value.trim()) : Number(value);

  if (!Number.isFinite(numeric) || numeric === UNKNOWN_COUNT) {
    return 0;
  }
  return numeric;
};

/**
 * The catalog of surveys, keyed by survey `key` (the same string stored in survey_response.survey_key).
 * This is the single source of truth for the frontend: which surveys exist, the tile image and
 * results component, the CDN directory, and the per-country version/availability. The database holds
 * only the responses.
 *
 * Adding a survey:
 *  1. Add a SURVEY_INFO entry here: image, ResultsComponent (omit for the generic thank-you page),
 *     cdnDirectory, versionsByCountry, and resolveVersion if the default version has localized files.
 *     For a child module, set parentSurveyId (and optionally isAvailable) and omit image/ResultsComponent.
 *  2. Add the title in useSurveyTitle.ts by calling t() with the key INSIGHTS.<KEY>.TITLE.
 *  3. Add that title string to public/locales/en/translation.json (English only; Crowdin propagates).
 *  4. Upload the survey's <version>.json to its CDN directory. A translatable default version goes
 *     in a per-language subfolder (e.g. fao/step01-survey.json for English, fao_fr/step01-survey_fr.json
 *     for French); a non-translatable, country-specific version (e.g. au) stays flat at the CDN
 *     directory root, no subfolder.
 */
export const SURVEY_INFO: Record<string, SurveyInfo> = {
  tape: {
    image: tape_survey,
    ResultsComponent: TapeResults,
    cdnDirectory: 'tape_surveys',
    versionsByCountry: { default: 'step01-survey', AU: 'au' },
    resolveVersion: resolveFaoVersion,
  },
  tape_economic: {
    parentSurveyId: 'tape',
    cdnDirectory: 'tape_surveys',
    versionsByCountry: { default: 'step2-economic' },
    resolveVersion: resolveFaoVersion,
    scoreField: 'econ_index',
    pages: 1,
    estimatedMinutes: 5,
  },
  tape_food_security: {
    parentSurveyId: 'tape',
    cdnDirectory: 'tape_surveys',
    versionsByCountry: { default: 'step2-food-security' },
    resolveVersion: resolveFaoVersion,
    scoreField: 'fies_score',
    pages: 1,
    estimatedMinutes: 5,
  },
  tape_dietary_diversity: {
    parentSurveyId: 'tape',
    cdnDirectory: 'tape_surveys',
    versionsByCountry: { default: 'step2-dietary-diversity' },
    resolveVersion: resolveFaoVersion,
    isAvailable: (parentResponse) =>
      toHouseholdCount(parentResponse.people?.hh_women) > 0 ||
      toHouseholdCount(parentResponse.people?.hh_fyoung) > 0,
    scoreField: 'dietary_score',
    pages: 3,
    estimatedMinutes: 10,
  },
  tape_youth: {
    parentSurveyId: 'tape',
    cdnDirectory: 'tape_surveys',
    versionsByCountry: { default: 'step2-youth' },
    resolveVersion: resolveFaoVersion,
    isAvailable: (parentResponse) =>
      toHouseholdCount(parentResponse.people?.hh_myoung) > 0 ||
      toHouseholdCount(parentResponse.people?.hh_fyoung) > 0,
    pages: 1,
    estimatedMinutes: 10,
  },
  tape_soil: {
    parentSurveyId: 'tape',
    cdnDirectory: 'tape_surveys',
    versionsByCountry: { default: 'step2-soil-health' },
    resolveVersion: resolveFaoVersion,
    scoreField: 'soilhealth_score',
    pages: 1,
    estimatedMinutes: 5,
  },
  tape_pesticides: {
    parentSurveyId: 'tape',
    cdnDirectory: 'tape_surveys',
    versionsByCountry: { default: 'step2-pesticides' },
    resolveVersion: resolveFaoVersion,
    pages: 1,
    estimatedMinutes: 10,
  },
  tape_land_aweai: {
    parentSurveyId: 'tape',
    cdnDirectory: 'tape_surveys',
    versionsByCountry: { default: 'step2-land-tenure-aweai' },
    resolveVersion: resolveFaoVersion,
    scoreField: 'aweai',
    pages: 9,
    estimatedMinutes: 25,
  },
  tape_productivity_biodiversity: {
    parentSurveyId: 'tape',
    cdnDirectory: 'tape_surveys',
    versionsByCountry: { default: 'step2-productivity-biodiversity' },
    resolveVersion: resolveFaoVersion,
    scoreField: 'GSI_overall',
    pages: 13,
    estimatedMinutes: 45,
  },
  cathi_gao: {
    image: tape_survey,
    cdnDirectory: 'idems_surveys',
    versionsByCountry: { NE: 'cathi_gao' }, // Niger only research project
  },
};

const LEGACY_FAO_SURVEY_VERSION = 'TAPE_CAET_STEP1_2025_V1';

/**
 * The CDN version of a survey for a given country, or undefined when the survey does not exist or is
 * not available in that country. A country-specific entry wins over the global 'default'.
 */
export const getLatestCdnPath = (
  surveyId: string,
  countryCode?: string,
  language: string = 'en',
): { version: string; fallbackVersion?: string } | undefined => {
  const info = SURVEY_INFO[surveyId];
  if (!info) {
    return undefined;
  }
  const countryOverride = countryCode && info.versionsByCountry[countryCode];
  if (countryOverride) {
    return { version: countryOverride };
  }
  const defaultVersion = info.versionsByCountry.default;
  if (!defaultVersion) {
    return undefined;
  }
  return info.resolveVersion?.(defaultVersion, language) ?? { version: defaultVersion };
};

export const getSurveyCdnPath = (
  surveyId: string,
  countryCode?: string,
  language: string = 'en',
  draftSurveyVersion?: string,
  hasDraft = false,
): { version: string; fallbackVersion?: string } | undefined => {
  const info = SURVEY_INFO[surveyId];
  if (!info) {
    return undefined;
  }

  const usesGlobalSurvey = !countryCode || !info.versionsByCountry[countryCode];

  const isLegacyFaoDraft =
    surveyId === 'tape' &&
    hasDraft &&
    usesGlobalSurvey &&
    (draftSurveyVersion === undefined || draftSurveyVersion === LEGACY_FAO_SURVEY_VERSION);

  if (isLegacyFaoDraft) {
    return { version: 'fao' };
  }

  return getLatestCdnPath(surveyId, countryCode, language);
};

/**
 * The survey ids available to a farm in the given country: those with a country-specific or global
 * version. Drives the Insights tile list.
 */
export const getAvailableSurveyIds = (countryCode?: string): string[] =>
  Object.keys(SURVEY_INFO).filter(
    (surveyId) =>
      // Hide child modules from the Insight tile list
      !SURVEY_INFO[surveyId].parentSurveyId &&
      getLatestCdnPath(surveyId, countryCode) !== undefined,
  );

export const CAET_SCORE_FIELD = 'caet_score';

export const getAvailableModuleIds = (
  parentSurveyId: string,
  parentResponse?: Record<string, unknown>,
): string[] => {
  if (!parentResponse || !(CAET_SCORE_FIELD in parentResponse)) {
    return [];
  }
  return Object.keys(SURVEY_INFO).filter((surveyId) => {
    const info = SURVEY_INFO[surveyId];
    const belongsToParent = info.parentSurveyId === parentSurveyId;
    const isModuleAvailable = info.isAvailable?.(parentResponse) ?? true;

    return belongsToParent && isModuleAvailable;
  });
};

/**
 * Where the back caret leads: a module returns to its parent's results page, a top-level survey to
 * the Insights list.
 */
export const getSurveyBackUrl = (surveyId: string): string => {
  const parentSurveyId = SURVEY_INFO[surveyId]?.parentSurveyId;

  return parentSurveyId ? `/insights/survey/${parentSurveyId}/results` : '/Insights';
};

export const getPostSubmitRoute = (surveyId: string): string =>
  `/insights/survey/${SURVEY_INFO[surveyId]?.parentSurveyId ?? surveyId}/results`;

export const getSurveyVersion = (surveyJson: any): string | undefined => {
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
