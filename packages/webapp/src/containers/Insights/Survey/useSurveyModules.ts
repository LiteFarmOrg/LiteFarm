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

import { useSelector } from 'react-redux';
import {
  useGetLatestSurveyResponsesQuery,
  useGetSurveyDraftsQuery,
  SurveyResponseRecord,
  SurveyDraftSummary,
} from '../../../store/api/surveyApi';
import {
  SURVEY_INFO,
  SurveyGaugeHalf,
  SurveyHalf,
  getAvailableModuleIds,
  toHouseholdCount,
} from './surveyConfig';
import { allSurveyDraftsSelector, SurveyDraft } from './surveyDraftSlice';
import { isLocalDraftStale } from './utils';
import { useSurveyTitles } from './useSurveyTitle';
import type { SurveyModule } from '../../../components/Insights/Survey/SurveyModuleSection';
import type { SurveyState } from '../../../components/Insights/Survey/SurveyModuleCard';
import {
  RISK_LEVELS,
  RiskLevel,
  SURVEY_SCORE_MAX,
  SurveyHalfResult,
} from '../../../components/Insights/Survey/utils';

const DEFAULT_ESTIMATED_MINUTES = 10;
const DEFAULT_PAGE_COUNT = 1;

const toFiniteNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const numeric = Number(value);

  return Number.isFinite(numeric) ? numeric : undefined;
};

const readScore = (response: SurveyResponseRecord, scoreField?: string): number | undefined =>
  scoreField ? toFiniteNumber(response.survey_response?.[scoreField]) : undefined;

const isRiskLevel = (value: unknown): value is RiskLevel =>
  (RISK_LEVELS as readonly unknown[]).includes(value);

const readRiskLevel = (
  response: SurveyResponseRecord,
  scoreField?: string,
): RiskLevel | undefined => {
  if (!scoreField) {
    return undefined;
  }
  const value = response.survey_response?.[scoreField];

  return isRiskLevel(value) ? value : undefined;
};

const NONE_ANSWER = '-97';
const CHOSEN_SECTIONS_FIELD = 'Step2_recommended';
const CROPS_QUESTIONS = ['cname', 'bio_crops'];
const ANIMALS_QUESTIONS = ['aname', 'animal_species'];

const toAnswerList = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const answeredNone = (answers: Record<string, any>, questions: string[]): boolean =>
  questions.some((question) => toAnswerList(answers[question]).includes(NONE_ANSWER));

const isSectionChosen = (answers: Record<string, any>, half: SurveyHalf): boolean =>
  !half.section || toAnswerList(answers[CHOSEN_SECTIONS_FIELD]).includes(half.section);

const hasNoWomen = (answers: Record<string, any>): boolean =>
  answers.hh_women !== undefined &&
  answers.hh_fyoung !== undefined &&
  toHouseholdCount(answers.hh_women) + toHouseholdCount(answers.hh_fyoung) === 0;

const readCropsOrAnimalsIndex = (answers: Record<string, any>): number | undefined => {
  if (answeredNone(answers, CROPS_QUESTIONS)) {
    return toFiniteNumber(answers.GSIndex_animals);
  }
  if (answeredNone(answers, ANIMALS_QUESTIONS)) {
    return toFiniteNumber(answers.GSIndex_crops);
  }
  return undefined;
};

const readHalfScore = (answers: Record<string, any>, half: SurveyGaugeHalf): number | undefined => {
  const score = toFiniteNumber(answers[half.scoreField]);

  if (score === undefined && half.fallback === 'crops-or-animals-index') {
    return readCropsOrAnimalsIndex(answers);
  }
  return score;
};

const toPercent = (score: number, maxStoredScore: number): number =>
  (score * SURVEY_SCORE_MAX) / maxStoredScore;

const getHalfResult = (answers: Record<string, any>, half: SurveyHalf): SurveyHalfResult => {
  const base = { id: half.id, display: half.display };

  if (!isSectionChosen(answers, half)) {
    return { ...base, status: 'not-applicable' };
  }
  if (half.display === 'dashboard-link') {
    return { ...base, status: 'completed' };
  }
  const score = readHalfScore(answers, half);

  if (score === undefined) {
    return {
      ...base,
      status: 'not-applicable',
      hasNoWomen: half.id === 'aweai' && hasNoWomen(answers),
    };
  }
  return { ...base, status: 'scored', score: toPercent(score, half.maxStoredScore) };
};

const getProgress = (currentPageNo: number, pages: number): number =>
  // Use + 0.5 offset to place progress halfway through the active page
  Math.min(Math.round((100 * (currentPageNo + 0.5)) / pages), 100);

const getSurveyState = (
  surveyId: string,
  response: SurveyResponseRecord | undefined,
  serverDraft: SurveyDraftSummary | undefined,
  localDraft: SurveyDraft | undefined,
  checkHasNewVersion: (surveyId: string, recordedVersion: string | undefined) => boolean,
): SurveyState => {
  const {
    scoreField,
    halves,
    pages = DEFAULT_PAGE_COUNT,
    estimatedMinutes,
  } = SURVEY_INFO[surveyId];

  const hasLocalDraft =
    !!localDraft &&
    Object.keys(localDraft.surveyData).length > 0 &&
    !isLocalDraftStale(localDraft, serverDraft);

  if (serverDraft?.has_data || hasLocalDraft) {
    const currentPageNo = Math.max(
      serverDraft?.current_page_no ?? 0,
      localDraft?.currentPageNo ?? 0,
    );
    const startedAt = serverDraft
      ? new Date(serverDraft.created_at)
      : new Date(localDraft?.updatedAt ?? Date.now());

    return { type: 'in-progress', progress: getProgress(currentPageNo, pages), startedAt };
  }

  if (response) {
    const hasNewVersion = checkHasNewVersion(surveyId, response.survey_version);

    return {
      type: 'completed',
      completedAt: new Date(response.created_at),
      score: readScore(response, scoreField),
      riskLevel: readRiskLevel(response, scoreField),
      halves: halves?.map((half) => getHalfResult(response.survey_response ?? {}, half)),
      hasNewVersion,
    };
  }

  return {
    type: 'not-started',
    estimatedMinutes: estimatedMinutes ?? DEFAULT_ESTIMATED_MINUTES,
  };
};

export const useSurveyModules = (
  parentSurveyId: string,
  checkHasNewVersion: (surveyId: string, recordedVersion: string | undefined) => boolean,
  parentResponse?: Record<string, any>,
): SurveyModule[] => {
  const titleBySurveyId = useSurveyTitles();
  const localDrafts: Record<string, SurveyDraft> = useSelector(allSurveyDraftsSelector);
  const moduleIds = getAvailableModuleIds(parentSurveyId, parentResponse);

  const { data: responses } = useGetLatestSurveyResponsesQuery(undefined, {
    skip: !moduleIds.length,
  });
  const { data: serverDrafts } = useGetSurveyDraftsQuery(undefined, { skip: !moduleIds.length });

  return moduleIds.map((surveyId) => {
    const survey = getSurveyState(
      surveyId,
      responses?.[surveyId],
      serverDrafts?.[surveyId],
      localDrafts[surveyId],
      checkHasNewVersion,
    );

    return {
      surveyId,
      title: titleBySurveyId[surveyId],
      scoreDisplay: SURVEY_INFO[surveyId].scoreDisplay,
      isJoint: survey.type === 'completed' && !!survey.halves,
      survey,
    };
  });
};
