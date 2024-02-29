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
  animalsUrl,
  animalBatchesUrl,
  animalGroupsUrl,
  url,
  defaultAnimalTypesUrl,
  customAnimalTypesUrl,
} from '../../apiConfig';
import type {
  Animal,
  AnimalBatch,
  AnimalGroup,
  CustomAnimalType,
  DefaultAnimalType,
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
  tagTypes: ['Animals', 'AnimalBatches', 'AnimalGroups', 'DefaultAnimalTypes', 'CustomAnimalTypes'],
  endpoints: (build) => ({
    // redux-toolkit.js.org/rtk-query/usage-with-typescript#typing-query-and-mutation-endpoints
    // <ResultType, QueryArg>
    getAnimals: build.query<Animal[], void>({
      query: () => `${animalsUrl}`,
      providesTags: ['Animals'],
    }),
    getAnimalBatches: build.query<AnimalBatch[], void>({
      query: () => `${animalBatchesUrl}`,
      providesTags: ['AnimalBatches'],
    }),
    getAnimalGroups: build.query<AnimalGroup[], void>({
      query: () => `${animalGroupsUrl}`,
      providesTags: ['AnimalGroups'],
    }),
    getDefaultAnimalTypes: build.query<DefaultAnimalType[], string>({
      query: (param = '') => `${defaultAnimalTypesUrl}${param}`,
      providesTags: ['DefaultAnimalTypes'],
    }),
    getCustomAnimalTypes: build.query<CustomAnimalType[], string>({
      query: (param = '') => `${customAnimalTypesUrl}${param}`,
      providesTags: ['CustomAnimalTypes'],
    }),
  }),
});

export const {
  useGetAnimalsQuery,
  useGetAnimalBatchesQuery,
  useGetAnimalGroupsQuery,
  useGetDefaultAnimalTypesQuery,
  useGetCustomAnimalTypesQuery,
} = api;
