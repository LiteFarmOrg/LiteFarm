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
import { surveyResponseUrl } from '../../apiConfig';
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

export const surveyApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Fetches the SurveyJS JSON definition from DO CDN.
    // Uses queryFn (not query) because this bypasses the LiteFarm API base URL and auth headers.
    getSurveyJson: build.query<Record<string, any>, { cdnDirectory: string; version: string }>({
      queryFn: async ({ cdnDirectory, version }) => {
        try {
          const response = await fetch(`${DO_CDN_URL}/${cdnDirectory}/${version}.json`);
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
  }),
});

export const {
  useGetSurveyJsonQuery,
  useGetLatestSurveyResponseQuery,
  useAddSurveyResponseMutation,
  usePrefetch,
} = surveyApi;
