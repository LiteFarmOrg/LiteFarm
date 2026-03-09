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
import { tapeSurveyUrl } from '../../apiConfig';
import { DO_CDN_URL } from '../../util/constants';

export interface TapeSurveyRecord {
  id?: string;
  farm_id: string;
  survey_response: Record<string, any>;
}

export const tapeSurveyApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Fetches the SurveyJS JSON definition from DO CDN.
    // Uses queryFn (not query) because this bypasses the LiteFarm API base URL and auth headers.
    getTapeSurveyJson: build.query<Record<string, any>, string>({
      queryFn: async (versionKey) => {
        try {
          const response = await fetch(`${DO_CDN_URL}/tape_surveys/${versionKey}.json`);
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
    getTapeSurvey: build.query<TapeSurveyRecord, void>({
      query: () => `${tapeSurveyUrl}`,
      providesTags: ['TapeSurvey'],
    }),
    submitTapeSurvey: build.mutation<TapeSurveyRecord, { survey_response: Record<string, any> }>({
      query: (body) => ({
        url: tapeSurveyUrl,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TapeSurvey'],
    }),
    updateTapeSurvey: build.mutation<
      TapeSurveyRecord,
      { id: string; survey_response: Record<string, any> }
    >({
      query: ({ id, survey_response }) => ({
        url: `${tapeSurveyUrl}/${id}`,
        method: 'PATCH',
        body: { survey_response },
      }),
      invalidatesTags: ['TapeSurvey'],
    }),
  }),
});

export const {
  useGetTapeSurveyJsonQuery,
  useGetTapeSurveyQuery,
  useSubmitTapeSurveyMutation,
  useUpdateTapeSurveyMutation,
  usePrefetch,
} = tapeSurveyApi;
