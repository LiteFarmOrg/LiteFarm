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
  tape_survey_id: number;
  farm_id: string;
  user_id: string;
  survey_data: Record<string, any>;
}

export const tapeSurveyApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Fetches the SurveyJS JSON definition from DO CDN.
    // Uses queryFn (not query) because this bypasses the LiteFarm API base URL and auth headers.
    getTapeSurveyJson: build.query<Record<string, any>, string>({
      queryFn: async (versionKey) => {
        try {
          const response = await fetch(`${DO_CDN_URL}/tape-surveys/v1/${versionKey}.json`);
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
    submitTapeSurvey: build.mutation<TapeSurveyRecord, { survey_data: Record<string, any> }>({
      query: (body) => ({
        url: tapeSurveyUrl,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TapeSurvey'],
    }),
  }),
});

export const { useGetTapeSurveyJsonQuery, useSubmitTapeSurveyMutation } = tapeSurveyApi;
