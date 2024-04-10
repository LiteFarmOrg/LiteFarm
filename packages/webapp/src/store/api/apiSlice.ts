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
  customAnimalBreedsUrl,
  customAnimalTypesUrl,
  defaultAnimalBreedsUrl,
  defaultAnimalTypesUrl,
  animalSexesUrl,
  animalRemovalReasonsUrl,
  animalIdentifierColorsUrl,
  animalIdentifierPlacementsUrl,
  animalOriginsUrl,
  url,
} from '../../apiConfig';
import type {
  Animal,
  AnimalBatch,
  AnimalGroup,
  CustomAnimalBreed,
  CustomAnimalType,
  DefaultAnimalBreed,
  DefaultAnimalType,
  AnimalSex,
  AnimalRemovalReason,
  AnimalIdentifierColor,
  AnimalIdentifierPlacement,
  AnimalOrigin,
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
    'Animals',
    'AnimalBatches',
    'AnimalGroups',
    'CustomAnimalBreeds',
    'CustomAnimalTypes',
    'DefaultAnimalBreeds',
    'DefaultAnimalTypes',
    'AnimalSexes',
    'AnimalRemovalReasons',
    'AnimalIdentifierColors',
    'AnimalIdentifierPlacements',
    'AnimalOrigins',
  ],
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
    getDefaultAnimalTypes: build.query<DefaultAnimalType[], string | void>({
      query: (param = '') => `${defaultAnimalTypesUrl}${param}`,
      providesTags: ['DefaultAnimalTypes'],
    }),
    getCustomAnimalTypes: build.query<CustomAnimalType[], string | void>({
      query: (param = '') => `${customAnimalTypesUrl}${param}`,
      providesTags: ['CustomAnimalTypes'],
    }),
    getCustomAnimalBreeds: build.query<CustomAnimalBreed[], void>({
      query: () => `${customAnimalBreedsUrl}`,
      providesTags: ['CustomAnimalBreeds'],
    }),
    getDefaultAnimalBreeds: build.query<DefaultAnimalBreed[], void>({
      query: () => `${defaultAnimalBreedsUrl}`,
      providesTags: ['DefaultAnimalBreeds'],
    }),
    getAnimalSexes: build.query<AnimalSex[], void>({
      query: () => `${animalSexesUrl}`,
      providesTags: ['AnimalSexes'],
    }),
    getAnimalRemovalReasons: build.query<AnimalRemovalReason[], void>({
      query: () => `${animalRemovalReasonsUrl}`,
      providesTags: ['AnimalRemovalReasons'],
    }),
    getAnimalIdentifierColors: build.query<AnimalIdentifierColor[], void>({
      query: () => `${animalIdentifierColorsUrl}`,
      providesTags: ['AnimalIdentifierColors'],
    }),
    getAnimalIdentifierPlacements: build.query<AnimalIdentifierPlacement[], void>({
      query: () => `${animalIdentifierPlacementsUrl}`,
      providesTags: ['AnimalIdentifierPlacements'],
    }),
    getAnimalOrigins: build.query<AnimalOrigin[], void>({
      query: () => `${animalOriginsUrl}`,
      providesTags: ['AnimalOrigins'],
    }),
    removeAnimals: build.mutation<Animal[], Partial<Animal>[]>({
      query: (patch) => ({
        url: `${animalsUrl}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['Animals', 'CustomAnimalTypes', 'DefaultAnimalTypes'],
    }),
    removeAnimalBatches: build.mutation<AnimalBatch[], Partial<AnimalBatch>[]>({
      query: (patch) => ({
        url: `${animalBatchesUrl}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['AnimalBatches', 'CustomAnimalTypes', 'DefaultAnimalTypes'],
    }),
    deleteAnimals: build.mutation<Animal[], number[]>({
      query: (del) => ({
        url: `${animalsUrl}`,
        method: 'DELETE',
        params: { ids: del },
      }),
      invalidatesTags: ['Animals', 'CustomAnimalTypes', 'DefaultAnimalTypes'],
    }),
    deleteAnimalBatches: build.mutation<AnimalBatch[], number[]>({
      query: (del) => ({
        url: `${animalBatchesUrl}`,
        method: 'DELETE',
        params: { ids: del },
      }),
      invalidatesTags: ['AnimalBatches', 'CustomAnimalTypes', 'DefaultAnimalTypes'],
    }),
  }),
});

export const {
  useGetAnimalsQuery,
  useGetAnimalBatchesQuery,
  useGetAnimalGroupsQuery,
  useGetCustomAnimalBreedsQuery,
  useGetCustomAnimalTypesQuery,
  useGetDefaultAnimalBreedsQuery,
  useGetDefaultAnimalTypesQuery,
  useGetAnimalSexesQuery,
  useGetAnimalRemovalReasonsQuery,
  useGetAnimalIdentifierColorsQuery,
  useGetAnimalIdentifierPlacementsQuery,
  useGetAnimalOriginsQuery,
  useRemoveAnimalsMutation,
  useRemoveAnimalBatchesMutation,
  useDeleteAnimalsMutation,
  useDeleteAnimalBatchesMutation,
} = api;
