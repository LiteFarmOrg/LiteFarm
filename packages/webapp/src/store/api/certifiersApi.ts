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
import { organicCertifierSurveyUrl } from '../../apiConfig';
import { SupportedCertificationSystemType, SupportedCertifier } from './types';

// Both endpoints below are served by the legacy /organic_certifier_survey routes.
// They still require farm_id as a URL path param (rather than the farm_id header the
// newer /certifications API relies on), so it's passed explicitly as the hook argument.
export const certifiersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSupportedCertifiers: build.query<SupportedCertifier[], string>({
      query: (farm_id) => ({
        url: `${organicCertifierSurveyUrl}/${farm_id}/supported_certifiers`,
        method: 'GET',
      }),
      providesTags: ['SupportedCertifiers'],
    }),
    getSupportedCertificationSystemTypes: build.query<SupportedCertificationSystemType[], string>({
      query: (farm_id) => ({
        url: `${organicCertifierSurveyUrl}/${farm_id}/supported_certifications`,
        method: 'GET',
      }),
      providesTags: ['CertificationSystemTypes'],
    }),
  }),
});

export const { useGetSupportedCertifiersQuery, useGetSupportedCertificationSystemTypesQuery } =
  certifiersApi;
