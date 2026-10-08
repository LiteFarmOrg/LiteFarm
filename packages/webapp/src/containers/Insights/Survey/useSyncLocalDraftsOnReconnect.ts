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

import { useEffect } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import type { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import { surveyApi } from '../../../store/api/surveyApi';
import { isAdminSelector } from '../../userFarmSlice';
import { useIsOffline } from '../../hooks/useOfflineDetector/useIsOffline';
import { allSurveyDraftsSelector, setDraftSubmissionId, SurveyDraft } from './surveyDraftSlice';
import { isLocalDraftStale } from './utils';
import type { RootState } from '../../../store/store';

type ThunkAppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

const syncedDraftTimestamps = new Map<string, number | undefined>();

const syncSingleDraft = async (
  dispatch: ThunkAppDispatch,
  surveyKey: string,
  draft: SurveyDraft,
  isPendingSubmission: boolean,
) => {
  const hasAnswers = Object.keys(draft.surveyData ?? {}).length > 0;
  if (!hasAnswers || !draft.surveyVersion || isPendingSubmission) {
    return;
  }

  const isAlreadySynced = syncedDraftTimestamps.get(surveyKey) === draft.updatedAt;
  if (isAlreadySynced) {
    return;
  }

  const draftRequest = dispatch(
    surveyApi.endpoints.getSurveyDraft.initiate(
      { surveyKey },
      { forceRefetch: true, subscribe: false },
    ),
  );
  let serverDraft;
  try {
    serverDraft = await draftRequest.unwrap();
  } catch {
    return;
  }

  const isServerNewer =
    !!serverDraft && new Date(serverDraft.updated_at).getTime() >= (draft.updatedAt ?? 0);

  if (isServerNewer || isLocalDraftStale(draft, serverDraft)) {
    syncedDraftTimestamps.set(surveyKey, draft.updatedAt);
    return;
  }

  const result = await dispatch(
    surveyApi.endpoints.upsertSurveyDraft.initiate({
      surveyKey,
      survey_version: draft.surveyVersion,
      submission_id: draft.submissionId,
      survey_data: draft.surveyData,
      current_page_no: draft.currentPageNo,
    }),
  );

  if ('data' in result && result.data) {
    syncedDraftTimestamps.set(surveyKey, draft.updatedAt);
    // Record any server-generated submission ID
    dispatch(
      setDraftSubmissionId({
        surveyId: surveyKey,
        submissionId: result.data.submission_id,
      }),
    );
  }
};

export default function useSyncLocalDraftsOnReconnect() {
  const store = useStore<RootState>();
  const dispatch = useDispatch<ThunkAppDispatch>();
  const isAdmin = useSelector(isAdminSelector);
  const isOffline = useIsOffline();
  const hasPendingSubmission = useSelector((state: RootState) =>
    Object.values(surveyApi.endpoints.getLatestSurveyResponses.select()(state).data ?? {}).some(
      (response) => response.to_sync,
    ),
  );

  useEffect(() => {
    if (!isAdmin || isOffline) {
      return;
    }

    const syncLocalDrafts = async () => {
      const state = store.getState();
      const responses = surveyApi.endpoints.getLatestSurveyResponses.select()(state).data;
      const drafts = allSurveyDraftsSelector(state);

      for (const [surveyKey, draft] of Object.entries(drafts)) {
        const isPendingSubmission = Boolean(responses?.[surveyKey]?.to_sync);
        await syncSingleDraft(dispatch, surveyKey, draft, isPendingSubmission);
      }
    };

    syncLocalDrafts();
  }, [isAdmin, isOffline, hasPendingSubmission]);
}
