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

import { api } from './apiSlice';
import { surveyResponseUrl, getSurveyDraftUrl } from '../../apiConfig';
import { DO_CDN_URL } from '../../util/constants';

export interface SurveyResponseRecord {
  id: string;
  farm_id: string;
  survey_key: string;
  survey_response: Record<string, any>;
  survey_version: string;
  project_id: string;
  survey_step: string;
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
  survey_step: string;
  survey_version: string;
  survey_data: Record<string, any>;
  current_page_no: number;
  updated_at: string;
}

export interface UpsertSurveyDraftReqBody {
  submission_id?: string;
  surveyKey: string;
  surveyStep?: string;
  survey_version: string;
  survey_data: Record<string, any>;
  current_page_no?: number;
}

const formatSurveyKeyStep = (surveyKey: string, surveyStep?: string) => {
  return surveyStep ? `${surveyKey}-${surveyStep}` : surveyKey;
};

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
          let response = await fetchSurvey(version);
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
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
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
    addSurveyResponse: build.mutation<void, AddSurveyResponseReqBody>({
      query: (body) => ({
        url: surveyResponseUrl,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { survey_key }) => [
        { type: 'SurveyResponse', id: survey_key },
      ],
    }),
    getSurveyDraft: build.query<
      SurveyDraftRecord | null,
      { surveyKey: string; surveyStep?: string }
    >({
      query: ({ surveyKey, surveyStep }) => ({
        url: getSurveyDraftUrl(surveyKey, surveyStep),
      }),
      providesTags: (_result, _error, { surveyKey, surveyStep }) => [
        { type: 'SurveyDraft', id: formatSurveyKeyStep(surveyKey, surveyStep) },
      ],
    }),
    upsertSurveyDraft: build.mutation<SurveyDraftRecord, UpsertSurveyDraftReqBody>({
      query: ({ surveyKey, surveyStep, ...body }) => ({
        url: getSurveyDraftUrl(surveyKey, surveyStep),
        method: 'PUT',
        body,
      }),
    }),
  }),
});

export const {
  useGetSurveyJsonQuery,
  useGetLatestSurveyResponseQuery,
  useAddSurveyResponseMutation,
  useGetSurveyDraftQuery,
  useUpsertSurveyDraftMutation,
  usePrefetch,
} = surveyApi;
