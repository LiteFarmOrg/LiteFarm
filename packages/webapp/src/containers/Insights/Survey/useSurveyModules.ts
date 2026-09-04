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
import { SURVEY_INFO, getAvailableModuleIds } from './surveyConfig';
import { allSurveyDraftsSelector, SurveyDraft } from './surveyDraftSlice';
import { useSurveyTitles } from './useSurveyTitle';
import type { SurveyModule } from '../../../components/Insights/Survey/SurveyModuleSection';
import type { SurveyState } from '../../../components/Insights/Survey/SurveyModuleCard';

const DEFAULT_ESTIMATED_MINUTES = 10;
const DEFAULT_PAGE_COUNT = 1;

const readScore = (response: SurveyResponseRecord, scoreField?: string): number | undefined => {
  if (!scoreField) {
    return undefined;
  }
  const score = Number(response.survey_response?.[scoreField]);

  return Number.isFinite(score) ? score : undefined;
};

const getProgress = (currentPageNo: number, pages: number): number =>
  // Use + 0.5 offset to place progress halfway through the active page
  Math.min(Math.round((100 * (currentPageNo + 0.5)) / pages), 100);

const getSurveyState = (
  surveyId: string,
  response: SurveyResponseRecord | undefined,
  serverDraft: SurveyDraftSummary | undefined,
  localDraft: SurveyDraft | undefined,
): SurveyState => {
  const { scoreField, pages = DEFAULT_PAGE_COUNT, estimatedMinutes } = SURVEY_INFO[surveyId];

  if (response) {
    return {
      type: 'completed',
      completedAt: new Date(response.created_at),
      score: readScore(response, scoreField),
    };
  }

  const hasLocalDraft = !!localDraft && Object.keys(localDraft.surveyData).length > 0;

  if (serverDraft || hasLocalDraft) {
    const currentPageNo = Math.max(
      serverDraft?.current_page_no ?? 0,
      localDraft?.currentPageNo ?? 0,
    );
    const startedAt = serverDraft
      ? new Date(serverDraft.created_at)
      : new Date(localDraft?.updatedAt ?? Date.now());

    return { type: 'in-progress', progress: getProgress(currentPageNo, pages), startedAt };
  }

  return {
    type: 'not-started',
    estimatedMinutes: estimatedMinutes ?? DEFAULT_ESTIMATED_MINUTES,
  };
};

export const useSurveyModules = (
  parentSurveyId: string,
  parentResponse?: Record<string, any>,
): SurveyModule[] => {
  const titleBySurveyId = useSurveyTitles();
  const localDrafts: Record<string, SurveyDraft> = useSelector(allSurveyDraftsSelector);
  const moduleIds = getAvailableModuleIds(parentSurveyId, parentResponse);

  const { data: responses } = useGetLatestSurveyResponsesQuery(undefined, {
    skip: !moduleIds.length,
  });
  const { data: serverDrafts } = useGetSurveyDraftsQuery(undefined, { skip: !moduleIds.length });

  return moduleIds.map((surveyId) => ({
    surveyId,
    title: titleBySurveyId[surveyId],
    survey: getSurveyState(
      surveyId,
      responses?.[surveyId],
      serverDrafts?.[surveyId],
      localDrafts[surveyId],
    ),
  }));
};
