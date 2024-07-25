/*
 *  Copyright 2024 LiteFarm.org
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

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import {
  soilAmendmentMethodsUrl,
  soilAmendmentPurposesUrl,
  soilAmendmentFertiliserTypesUrl,
  productUrl,
  url,
} from '../../apiConfig';
import type {
  SoilAmendmentMethod,
  SoilAmendmentPurpose,
  SoilAmendmentFertiliserType,
  SoilAmendmentProduct,
} from './types';

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: url,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;

      headers.set('Content-Type', 'application/json');
      headers.set('Authorization', `Bearer ${localStorage.getItem('id_token')}`);
      headers.set('user_id', state.entitiesReducer.userFarmReducer.user_id || '');
      headers.set('farm_id', state.entitiesReducer.userFarmReducer.farm_id || '');

      return headers;
    },
    responseHandler: 'content-type',
  }),
  tagTypes: [
    'SoilAmendmentMethods',
    'SoilAmendmentPurposes',
    'SoilAmendmentFertiliserTypes',
    'SoilAmendmentProduct',
  ],
  endpoints: (build) => ({
    // redux-toolkit.js.org/rtk-query/usage-with-typescript#typing-query-and-mutation-endpoints
    // <ResultType, QueryArg>
    getSoilAmendmentMethods: build.query<SoilAmendmentMethod[], void>({
      query: () => `${soilAmendmentMethodsUrl}`,
      providesTags: ['SoilAmendmentMethods'],
    }),
    getSoilAmendmentPurposes: build.query<SoilAmendmentPurpose[], void>({
      query: () => `${soilAmendmentPurposesUrl}`,
      providesTags: ['SoilAmendmentPurposes'],
    }),
    getSoilAmendmentFertiliserTypes: build.query<SoilAmendmentFertiliserType[], void>({
      query: () => `${soilAmendmentFertiliserTypesUrl}`,
      providesTags: ['SoilAmendmentFertiliserTypes'],
    }),
    addSoilAmendmentProduct: build.mutation<SoilAmendmentProduct, Partial<SoilAmendmentProduct>>({
      query: (body) => ({
        url: `${productUrl}`,
        method: 'POST',
        body,
      }),
    }),
    updateSoilAmendmentProduct: build.mutation<SoilAmendmentProduct, Partial<SoilAmendmentProduct>>(
      {
        query: ({ product_id, ...patch }) => ({
          url: `${productUrl}/${product_id}`,
          method: 'PATCH',
          body: patch,
        }),
      },
    ),
  }),
});

export const {
  useGetSoilAmendmentMethodsQuery,
  useGetSoilAmendmentPurposesQuery,
  useGetSoilAmendmentFertiliserTypesQuery,
  useAddSoilAmendmentProductMutation,
  useUpdateSoilAmendmentProductMutation,
} = api;
