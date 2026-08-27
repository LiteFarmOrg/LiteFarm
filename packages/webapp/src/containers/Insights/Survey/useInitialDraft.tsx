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

import { useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { surveyDraftSelector } from './surveyDraftSlice';
import { useGetSurveyDraftQuery } from '../../../store/api/surveyApi';

export type InitialDraftResult =
  | { isDraftLoading: true; initialDraft: Record<string, never> }
  | {
      isDraftLoading: false;
      initialDraft: {
        submissionId: string | undefined;
        surveyVersion: string | undefined;
        surveyData: Record<string, any>;
        currentPageNo: number;
        updatedAt: number | undefined;
        needsLocalSync: boolean;
      };
    };

function useInitialDraft(surveyId: string, surveyStep?: string) {
  const localDraft = useSelector(surveyDraftSelector(surveyId, surveyStep));
  const { data: serverDraft, isFetching } = useGetSurveyDraftQuery(
    { surveyKey: surveyId, surveyStep },
    { skip: !surveyId, refetchOnMountOrArgChange: true },
  );

  const resolvedRef = useRef<InitialDraftResult | null>(null);

  return useMemo<InitialDraftResult>(() => {
    if (resolvedRef.current) {
      return resolvedRef.current;
    }

    if (isFetching) {
      return { isDraftLoading: true, initialDraft: {} };
    }

    const isLocalDraftStale =
      (Object.keys(localDraft.surveyData).length === 0 && serverDraft?.submission_id) ||
      (localDraft.submissionId && localDraft.submissionId !== serverDraft?.submission_id);

    // The draft has been completed on the server, and there is no new server draft
    if (isLocalDraftStale && !serverDraft) {
      resolvedRef.current = {
        isDraftLoading: false,
        initialDraft: {
          submissionId: undefined,
          surveyVersion: undefined,
          surveyData: {},
          currentPageNo: 0,
          needsLocalSync: true,
          updatedAt: undefined,
        },
      };
      return resolvedRef.current;
    }

    const shouldAdoptServer =
      !!serverDraft &&
      (isLocalDraftStale ||
        new Date(serverDraft.updated_at).getTime() >= (localDraft.updatedAt ?? 0));

    const initialDraft = shouldAdoptServer
      ? {
          submissionId: serverDraft.submission_id,
          surveyVersion: serverDraft.survey_version,
          surveyData: serverDraft.survey_data,
          currentPageNo: serverDraft.current_page_no,
          updatedAt: new Date(serverDraft.updated_at).getTime(),
          needsLocalSync: true,
        }
      : {
          submissionId: localDraft.submissionId,
          surveyVersion: localDraft.surveyVersion,
          surveyData: localDraft.surveyData,
          currentPageNo: localDraft.currentPageNo,
          updatedAt: localDraft.updatedAt,
          needsLocalSync: false,
        };

    resolvedRef.current = { isDraftLoading: false, initialDraft };
    return resolvedRef.current;

    // Omit serverDraft/localDraft, so a local edit alone never re-runs this.
    // isFetching also fires on unrelated refetches, but resolvedRef locks in
    // the first result so those don't produce a new one.
  }, [isFetching]);
}

export default useInitialDraft;
