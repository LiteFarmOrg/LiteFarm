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

import { useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as Sentry from '@sentry/react';
import { clearSurvey, saveSurveyProgress, setDraftSubmissionId } from './surveyDraftSlice';
import { useUpsertSurveyDraftMutation } from '../../../store/api/surveyApi';
import { isFetchBaseQueryError } from '../../../store/api/typeGuards';
import { InitialDraftResult } from './useInitialDraft';

type UseSurveyDraftSyncProps = InitialDraftResult & {
  surveyId: string;
  surveyVersion?: string;
};

function useSurveyDraftSync({
  surveyId,
  surveyVersion = '',
  isDraftLoading,
  initialDraft,
}: UseSurveyDraftSyncProps) {
  const dispatch = useDispatch();

  const [upsertSurveyDraft] = useUpsertSurveyDraftMutation();

  const submissionIdRef = useRef(initialDraft.submissionId);

  // Upserts the draft to the server, then syncs the returned submission_id into Redux.
  const persistDraft = useCallback(
    async (
      payload: { survey_data: Record<string, any>; current_page_no?: number },
      { shouldReportErrors = false }: { shouldReportErrors?: boolean } = {},
    ) => {
      if (!surveyVersion) {
        return;
      }
      try {
        const created = await upsertSurveyDraft({
          surveyKey: surveyId,
          survey_version: surveyVersion,
          submission_id: submissionIdRef.current,
          ...payload,
        }).unwrap();

        submissionIdRef.current = created.submission_id;

        dispatch(setDraftSubmissionId({ surveyId, submissionId: created.submission_id }));
      } catch (error) {
        if (isFetchBaseQueryError(error) && error.status === 409) {
          if (shouldReportErrors) {
            Sentry.captureException('Draft save rejected: survey already completed', {
              tags: { surveyId },
              extra: { submissionId: submissionIdRef.current },
            });
          }
          return;
        }
        // Best effort — a later save trigger will retry.
      }
    },
    [surveyId, surveyVersion, dispatch, upsertSurveyDraft],
  );

  const latestDraftRef = useRef({
    surveyData: initialDraft.surveyData,
    currentPageNo: initialDraft.currentPageNo,
  });

  const recordLatestDraft = (surveyData: Record<string, any>, currentPageNo: number) => {
    latestDraftRef.current = { surveyData, currentPageNo };
  };

  useEffect(() => {
    return () => {
      persistDraft({
        survey_data: latestDraftRef.current.surveyData,
        current_page_no: latestDraftRef.current.currentPageNo,
      });
    };
    // persistDraft must be a dependency, or the cleanup stays frozen on the mount-time closure
    // where surveyVersion is still undefined, and no-ops forever.
  }, [persistDraft]);

  // Resolve this survey's draft state with the server on mount: adopt the server's draft when it
  // should win, discard local content when its submission_id no longer matches anything live on
  // the server, or register the local draft with the server for the first time.
  useEffect(() => {
    if (
      !surveyVersion ||
      isDraftLoading ||
      (!initialDraft.needsLocalSync && initialDraft.submissionId)
    ) {
      return;
    }

    if (initialDraft.needsLocalSync) {
      if (initialDraft.submissionId) {
        dispatch(
          saveSurveyProgress({
            surveyId,
            currentPageNo: initialDraft.currentPageNo,
            surveyData: initialDraft.surveyData,
            surveyVersion: initialDraft.surveyVersion,
            updatedAt: initialDraft.updatedAt,
          }),
        );
        return;
      }

      // Local's submission_id points to a draft that's already been completed, and no new server
      // draft replaced it — discard the stale local content rather than keep building on it.
      dispatch(clearSurvey({ surveyId }));
      persistDraft({ survey_data: {}, current_page_no: 0 });
      return;
    }

    // Local wins by default but has never been sent to the server before — register it now.
    persistDraft({
      survey_data: initialDraft.surveyData,
      current_page_no: initialDraft.currentPageNo,
    });
  }, [surveyVersion, isDraftLoading, initialDraft, surveyId, dispatch, persistDraft]);

  const onCurrentPageChanged = useCallback(
    (currentPageNo: number, surveyData: Record<string, unknown>) => {
      persistDraft(
        {
          current_page_no: currentPageNo,
          survey_data: surveyData,
        },
        { shouldReportErrors: true },
      );
      recordLatestDraft(surveyData, currentPageNo);
    },
    [persistDraft],
  );

  return { onCurrentPageChanged, recordLatestDraft };
}

export default useSurveyDraftSync;
