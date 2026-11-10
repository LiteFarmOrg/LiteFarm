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
import type { SurveyHalfId, SurveyScoreDisplay } from '../../../components/Insights/Survey/utils';

export const PRODUCTIVITY_BIODIVERSITY_SECTION_QUESTION = 'Step2_recommended';

export enum ProductivityBiodiversitySection {
  PRODUCTIVITY = '1',
  BIODIVERSITY = '5',
}

export interface SurveyGaugeHalf {
  id: SurveyHalfId;
  display: 'gauge';
  scoreField: string;
  maxStoredScore: number;
  fallback?: 'crops-or-animals-index';
  section?: ProductivityBiodiversitySection;
}

export interface SurveyDashboardLinkHalf {
  id: SurveyHalfId;
  display: 'dashboard-link';
  section?: ProductivityBiodiversitySection;
}

export type SurveyHalf = SurveyGaugeHalf | SurveyDashboardLinkHalf;

// A CDN path without .json, relative to cdnDirectory, plus a fallback to try if it's missing.
export interface SurveyCdnPath {
  path: string;
  fallbackPath?: string;
}

interface SurveyInfo {
  image?: string;
  ResultsComponent?: ComponentType<{ surveyId: string }>;
  // CDN directory under DO_CDN_URL holding the survey's file(s), optionally nested under a per-language
  // subfolder (see resolvePath below).
  cdnDirectory: string;
  // Path (without .json) of the latest definition, relative to cdnDirectory. If resolvePath is set,
  // it is used as the input to resolvePath instead (e.g. 'step01-survey' -> 'fao_fr/step01-survey_fr').
  fileStem: string;
  // Whether a farm can see this survey (Insights tile + direct URL). Omit if available everywhere.
  isAvailableForFarm?: (location: { countryCode?: string }) => boolean;
  // Resolves the path to request for a language, plus a fallbackPath for the untranslated default
  // if that's missing. Omit if the fileStem has no per-language content (e.g. cathi_gao).
  resolvePath?: (fileStem: string, language: string) => SurveyCdnPath;
  // Whether this survey has archived per-version copies on the CDN.
  hasArchivedVersions?: boolean;
  allowsUpdate?: boolean;
  parentSurveyId?: string;
  isAvailable?: (parentResponse: Record<string, any>) => boolean;
  scoreField?: string;
  scoreDisplay?: SurveyScoreDisplay;
  halves?: SurveyHalf[];
  pages?: number;
  estimatedMinutes?: number;
}

const resolveFaoPath = (fileStem: string, language: string) =>
  language === 'en'
    ? { path: `fao/${fileStem}` }
    : {
        path: `fao_${language}/${fileStem}_${language}`,
        fallbackPath: `fao/${fileStem}`,
      };

const UNKNOWN_COUNT = -99;

export const toHouseholdCount = (value: unknown): number => {
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
 * results component, the CDN directory, the file stem, and the per-farm availability.
 * The database holds only the responses.
 *
 * Adding a survey:
 *  1. Add a SURVEY_INFO entry here: image, ResultsComponent (omit for the generic thank-you page),
 *     cdnDirectory, fileStem, isAvailableForFarm if the survey is only available for certain farms,
 *     and resolvePath if the survey has localized files.
 *     For a child module, set parentSurveyId (and optionally isAvailable) and omit image/ResultsComponent.
 *  2. Add the title in useSurveyTitle.ts by calling t() with the key INSIGHTS.<KEY>.TITLE.
 *  3. Add that title string to public/locales/en/translation.json (English only; Crowdin propagates).
 *  4. Upload the survey's JSON to its CDN directory at <fileStem>.json, or at the paths resolvePath
 *     returns if set (e.g. fao/step01-survey.json for English, fao_fr/step01-survey_fr.json for French).
 *  5. If the CDN directory is new, add it to SURVEY_DEFINITION_DIRECTORIES in src/sw.js so its
 *     definitions are cached for offline use.
 */
export const SURVEY_INFO: Record<string, SurveyInfo> = {
  tape: {
    image: tape_survey,
    ResultsComponent: TapeResults,
    cdnDirectory: 'tape_surveys',
    fileStem: 'step01-survey',
    resolvePath: resolveFaoPath,
    hasArchivedVersions: true,
  },
  tape_land_aweai: {
    parentSurveyId: 'tape',
    cdnDirectory: 'tape_surveys',
    fileStem: 'step2-land-tenure-aweai',
    resolvePath: resolveFaoPath,
    hasArchivedVersions: true,
    scoreField: 'aweai',
    halves: [
      {
        id: 'land_tenure',
        display: 'gauge',
        scoreField: 'landtenure_score_household',
        maxStoredScore: 1,
      },
      {
        id: 'aweai',
        display: 'gauge',
        scoreField: 'aweai',
        maxStoredScore: 100,
      },
    ],
    pages: 9,
    estimatedMinutes: 15,
  },
  tape_productivity_biodiversity: {
    parentSurveyId: 'tape',
    cdnDirectory: 'tape_surveys',
    fileStem: 'step2-productivity-biodiversity',
    resolvePath: resolveFaoPath,
    hasArchivedVersions: true,
    scoreField: 'GSI_overall',
    halves: [
      {
        id: 'biodiversity',
        display: 'gauge',
        scoreField: 'GSI_overall',
        maxStoredScore: 100,
        fallback: 'crops-or-animals-index',
        section: ProductivityBiodiversitySection.BIODIVERSITY,
      },
      {
        id: 'productivity',
        display: 'dashboard-link',
        section: ProductivityBiodiversitySection.PRODUCTIVITY,
      },
    ],
    pages: 13,
    estimatedMinutes: 15,
  },
  tape_economic: {
    parentSurveyId: 'tape',
    cdnDirectory: 'tape_surveys',
    fileStem: 'step2-economic',
    resolvePath: resolveFaoPath,
    hasArchivedVersions: true,
    scoreField: 'econ_index',
    pages: 1,
    estimatedMinutes: 2,
  },
  tape_food_security: {
    parentSurveyId: 'tape',
    cdnDirectory: 'tape_surveys',
    fileStem: 'step2-food-security',
    resolvePath: resolveFaoPath,
    hasArchivedVersions: true,
    scoreField: 'fies_score',
    pages: 1,
    estimatedMinutes: 2,
  },
  tape_dietary_diversity: {
    parentSurveyId: 'tape',
    cdnDirectory: 'tape_surveys',
    fileStem: 'step2-dietary-diversity',
    resolvePath: resolveFaoPath,
    hasArchivedVersions: true,
    isAvailable: (parentResponse) =>
      toHouseholdCount(parentResponse.people?.hh_women) > 0 ||
      toHouseholdCount(parentResponse.people?.hh_fyoung) > 0,
    scoreField: 'dietary_score',
    pages: 3,
    estimatedMinutes: 3,
  },
  tape_youth: {
    parentSurveyId: 'tape',
    cdnDirectory: 'tape_surveys',
    fileStem: 'step2-youth',
    resolvePath: resolveFaoPath,
    hasArchivedVersions: true,
    isAvailable: (parentResponse) =>
      toHouseholdCount(parentResponse.people?.hh_myoung) > 0 ||
      toHouseholdCount(parentResponse.people?.hh_fyoung) > 0,
    scoreField: 'youth_score',
    pages: 1,
    estimatedMinutes: 3,
  },
  tape_soil: {
    parentSurveyId: 'tape',
    cdnDirectory: 'tape_surveys',
    fileStem: 'step2-soil-health',
    resolvePath: resolveFaoPath,
    hasArchivedVersions: true,
    scoreField: 'soilhealth_score',
    pages: 1,
    estimatedMinutes: 3,
  },
  tape_pesticides: {
    parentSurveyId: 'tape',
    cdnDirectory: 'tape_surveys',
    fileStem: 'step2-pesticides',
    resolvePath: resolveFaoPath,
    hasArchivedVersions: true,
    scoreField: 'final_exposure',
    scoreDisplay: 'risk',
    pages: 1,
    estimatedMinutes: 4,
  },
  tape_au: {
    image: tape_survey,
    ResultsComponent: TapeResults,
    cdnDirectory: 'tape_surveys',
    fileStem: 'au/au',
    isAvailableForFarm: ({ countryCode }) => countryCode === 'AU',
  },
  tape_bc: {
    image: tape_survey,
    ResultsComponent: TapeResults,
    cdnDirectory: 'tape_surveys',
    fileStem: 'ca-bc/ca-bc',
    isAvailableForFarm: ({ countryCode }) => countryCode === 'CA',
    allowsUpdate: true,
  },
  cathi_gao: {
    image: tape_survey,
    cdnDirectory: 'idems_surveys',
    fileStem: 'cathi_gao',
    isAvailableForFarm: ({ countryCode }) => countryCode === 'NE',
  },
};

const LEGACY_FAO_SURVEY_VERSION = 'TAPE_CAET_STEP1_2025_V1';

/**
 * The CDN path (without .json) of a survey's latest definition, or undefined when the survey
 * does not exist.
 */
export const getLatestCdnPath = (
  surveyId: string,
  language: string = 'en',
): SurveyCdnPath | undefined => {
  const info = SURVEY_INFO[surveyId];
  if (!info) {
    return undefined;
  }
  return info.resolvePath?.(info.fileStem, language) ?? { path: info.fileStem };
};

export const getSurveyCdnPath = (
  surveyId: string,
  language: string = 'en',
  draftSurveyVersion?: string,
  hasDraft = false,
): SurveyCdnPath | undefined => {
  const info = SURVEY_INFO[surveyId];
  if (!info) {
    return undefined;
  }

  const isLegacyFaoDraft =
    surveyId === 'tape' &&
    hasDraft &&
    (draftSurveyVersion === undefined || draftSurveyVersion === LEGACY_FAO_SURVEY_VERSION);

  if (isLegacyFaoDraft) {
    return { path: 'fao' };
  }

  // Latest: `${latest.path}.json` (e.g. 'fao/step01-survey.json').
  // Archived: `${latest.path}/<survey_version>.json`
  // (e.g. 'fao/step01-survey/TAPE_FAO_STEP1_20260714_132600.json').
  const latest = getLatestCdnPath(surveyId, language);
  if (!latest) {
    return undefined;
  }

  if (hasDraft && draftSurveyVersion && info.hasArchivedVersions) {
    return {
      path: `${latest.path}/${draftSurveyVersion}`,
      fallbackPath: latest.fallbackPath
        ? `${latest.fallbackPath}/${draftSurveyVersion}`
        : undefined,
    };
  }

  return latest;
};

/**
 * The survey ids available to a farm in the given location. Drives the Insights tile list.
 */
export const getAvailableSurveyIds = (location: { countryCode?: string }): string[] =>
  Object.keys(SURVEY_INFO).filter(
    (surveyId) =>
      // Hide child modules from the Insight tile list
      !SURVEY_INFO[surveyId].parentSurveyId &&
      SURVEY_INFO[surveyId].isAvailableForFarm?.(location) !== false,
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

export const hasNewSurveyVersion = (recordedVersion?: string, latestVersion?: string): boolean => {
  if (!recordedVersion || !latestVersion) {
    return false;
  }
  return recordedVersion !== latestVersion;
};

export const getLatestSurveyVersion = (
  surveyId: string,
  language: string,
  manifest: Record<string, string> | undefined,
): string | undefined => {
  if (!manifest) {
    return undefined;
  }
  const latest = getLatestCdnPath(surveyId, language);
  if (!latest) {
    return undefined;
  }
  return manifest[latest.path] ?? (latest.fallbackPath ? manifest[latest.fallbackPath] : undefined);
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
