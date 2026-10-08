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

import { v4 as uuidv4 } from 'uuid';
import i18n from 'i18next';
import { api } from './apiSlice';
import {
  surveyResponseUrl,
  latestSurveyResponsesUrl,
  surveyDraftsUrl,
  getSurveyDraftUrl,
} from '../../apiConfig';
import { DO_CDN_URL } from '../../util/constants';
import { getSurveyVersion } from '../../containers/Insights/Survey/utils';
import { enqueueSuccessSnackbar } from '../../containers/Snackbar/snackbarSlice';
import { isOfflineSelector } from '../../containers/hooks/useOfflineDetector/offlineDetectorSlice';
import { isNetworkError } from '../../util/apiUtils';
import { RootState } from '../store';

export interface SurveyResponseRecord {
  id: string;
  farm_id: string;
  survey_key: string;
  survey_response: Record<string, any>;
  survey_version: string;
  project_id: string;
  survey_step: string;
  created_at: string;
  to_sync?: boolean;
}

export interface AddSurveyResponseReqBody {
  farm_id: string;
  survey_key: string;
  survey_response: Record<string, any>;
}

export interface SurveyDraftRecord {
  id: string;
  submission_id: string;
  farm_id: string;
  survey_key: string;
  survey_version: string;
  survey_data: Record<string, any>;
  current_page_no: number;
  created_at: string;
  updated_at: string;
}

export type SurveyDraftSummary = Pick<
  SurveyDraftRecord,
  'submission_id' | 'current_page_no' | 'created_at'
> & {
  has_data: boolean;
};

export interface UpsertSurveyDraftReqBody {
  submission_id?: string;
  surveyKey: string;
  survey_version: string;
  survey_data: Record<string, any>;
  current_page_no?: number;
}

export const surveyApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Fetches the SurveyJS JSON definition from DO CDN.
    // Uses queryFn (not query) because this bypasses the LiteFarm API base URL and auth headers.
    getSurveyJson: build.query<
      Record<string, any>,
      { cdnDirectory: string; version: string; fallbackVersion?: string }
    >({
      queryFn: async ({ cdnDirectory, version, fallbackVersion }) => {
        const fetchSurvey = (filename: string) =>
          fetch(`${DO_CDN_URL}/${cdnDirectory}/${filename}.json`);
        try {
          let response = await fetchSurvey(version).catch((error) => {
            if (!fallbackVersion) {
              throw error;
            }
            return fetchSurvey(fallbackVersion);
          });
          // DO Spaces returns 403 (not 404) for a file that doesn't exist, since the bucket
          // won't confirm or deny what files exist to unauthenticated requests like this one.
          if (!response.ok && [403, 404].includes(response.status) && fallbackVersion) {
            response = await fetchSurvey(fallbackVersion);
          }
          if (!response.ok) {
            return {
              error: { status: response.status, data: `Failed to fetch survey JSON` },
            };
          }
          const data = await response.json();
          return { data };
        } catch (error) {
          // Request failed with no response (usually offline)
          // A pinned draft's version is e.g. `fao/step01-survey/TAPE_FAO_STEP1_20260714_132600`: try the
          // cached latest file or its English fallback, and use it only if the survey_version matches
          const pinnedVersion = version.split('/')[2];
          if (pinnedVersion) {
            const toLatest = (path: string) => path.replace(`/${pinnedVersion}`, '');
            const response = await fetchSurvey(toLatest(version))
              .catch(() => (fallbackVersion ? fetchSurvey(toLatest(fallbackVersion)) : undefined))
              .catch(() => undefined);
            const data = response?.ok ? await response.json().catch(() => undefined) : undefined;
            if (getSurveyVersion(data) === pinnedVersion) {
              return { data };
            }
          }
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
    }),
    getSurveyVersionManifest: build.query<Record<string, string>, string>({
      queryFn: async (cdnDirectory) => {
        try {
          const response = await fetch(`${DO_CDN_URL}/${cdnDirectory}/versions.json`);
          if (!response.ok) {
            return { data: {} };
          }
          const data = await response.json();
          return { data: data && typeof data === 'object' ? data : {} };
        } catch {
          return { data: {} };
        }
      },
    }),
    getLatestSurveyResponse: build.query<SurveyResponseRecord | null, { surveyKey: string }>({
      query: ({ surveyKey }) => ({
        url: surveyResponseUrl,
        params: { survey_key: surveyKey },
      }),
      providesTags: (_result, _error, { surveyKey }) => [{ type: 'SurveyResponse', id: surveyKey }],
    }),
    getLatestSurveyResponses: build.query<Record<string, SurveyResponseRecord>, void>({
      query: () => ({
        url: latestSurveyResponsesUrl,
      }),
      providesTags: [{ type: 'SurveyResponse', id: 'LIST' }],
    }),
    addSurveyResponse: build.mutation<void, AddSurveyResponseReqBody>({
      query: (body) => ({
        url: surveyResponseUrl,
        method: 'POST',
        body,
      }),
      async onQueryStarted(
        { survey_key, survey_response, farm_id },
        { dispatch, queryFulfilled, getState },
      ) {
        const optimisticResponse: SurveyResponseRecord = {
          id: uuidv4(),
          farm_id,
          survey_key,
          survey_response,
          survey_version: String(survey_response.survey_version ?? ''),
          project_id: String(survey_response.project_id ?? ''),
          survey_step: String(survey_response.survey_step ?? ''),
          created_at: new Date().toISOString(),
          to_sync: true,
        };

        const { upsertQueryData, updateQueryData } = surveyApi.util;

        // Set the optimistic response as the latest submission for this survey
        dispatch(
          upsertQueryData('getLatestSurveyResponse', { surveyKey: survey_key }, optimisticResponse),
        );

        // Add the optimistic response to the all-surveys response dictionary
        const responsesPatch = dispatch(
          updateQueryData('getLatestSurveyResponses', undefined, (draft) => {
            draft[survey_key] = optimisticResponse;
          }),
        );

        // Clear the active draft since the survey has now been submitted
        dispatch(upsertQueryData('getSurveyDraft', { surveyKey: survey_key }, null));

        // Remove this survey from the list of in-progress drafts
        const draftsPatch = dispatch(
          updateQueryData('getSurveyDrafts', undefined, (draft) => {
            delete draft[survey_key];
          }),
        );

        try {
          await queryFulfilled;
        } catch (error) {
          if (isNetworkError(error)) {
            const isOffline = isOfflineSelector(getState() as RootState);
            dispatch(
              enqueueSuccessSnackbar(
                isOffline
                  ? i18n.t('message:SURVEY.SYNC.SUBMIT.ONLINE')
                  : i18n.t('message:SURVEY.SYNC.SUBMIT.NETWORK_ERROR'),
              ),
            );
          } else {
            // Revert list optimistic patches on true server error
            responsesPatch.undo();
            draftsPatch.undo();
          }
        }
      },
      invalidatesTags: (_result, _error, { survey_key }) => [
        { type: 'SurveyResponse', id: survey_key },
        { type: 'SurveyResponse', id: 'LIST' },
        { type: 'SurveyDraft', id: survey_key },
        { type: 'SurveyDraft', id: 'LIST' },
      ],
    }),
    getSurveyDraft: build.query<SurveyDraftRecord | null, { surveyKey: string }>({
      query: ({ surveyKey }) => ({
        url: getSurveyDraftUrl(surveyKey),
      }),
      providesTags: (_result, _error, { surveyKey }) => [{ type: 'SurveyDraft', id: surveyKey }],
    }),
    getSurveyDrafts: build.query<Record<string, SurveyDraftSummary>, void>({
      query: () => ({
        url: surveyDraftsUrl,
      }),
      providesTags: [{ type: 'SurveyDraft', id: 'LIST' }],
    }),
    upsertSurveyDraft: build.mutation<SurveyDraftRecord, UpsertSurveyDraftReqBody>({
      query: ({ surveyKey, ...body }) => ({
        url: getSurveyDraftUrl(surveyKey),
        method: 'PUT',
        body,
      }),
      invalidatesTags: [{ type: 'SurveyDraft', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetSurveyJsonQuery,
  useGetSurveyVersionManifestQuery,
  useGetLatestSurveyResponseQuery,
  useGetLatestSurveyResponsesQuery,
  useAddSurveyResponseMutation,
  useLazyGetSurveyDraftQuery,
  useGetSurveyDraftsQuery,
  useUpsertSurveyDraftMutation,
  usePrefetch,
} = surveyApi;
