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

import { createApi } from '@reduxjs/toolkit/query/react';
import {
  defaultAnimalBreedsUrl,
  animalSexesUrl,
  animalIdentifierTypesUrl,
  animalIdentifierColorsUrl,
  animalOriginsUrl,
  animalUsesUrl,
  animalRemovalReasonsUrl,
  soilAmendmentMethodsUrl,
  soilAmendmentPurposesUrl,
  soilAmendmentFertiliserTypesUrl,
  animalMovementPurposesUrl,
} from '../../apiConfig';
import type {
  DefaultAnimalBreed,
  AnimalSex,
  AnimalRemovalReason,
  SoilAmendmentMethod,
  SoilAmendmentPurpose,
  SoilAmendmentFertiliserType,
  AnimalIdentifierType,
  AnimalIdentifierColor,
  AnimalOrigin,
  AnimalUse,
  AnimalMovementPurpose,
} from './types';

import { LIBRARY_API_TAGS } from './apiTags';
import { BASE_QUERY } from './constants';

export const libraryApi = createApi({
  reducerPath: 'libraryApi',
  baseQuery: BASE_QUERY,
  tagTypes: LIBRARY_API_TAGS,
  endpoints: (build) => ({
    // redux-toolkit.js.org/rtk-query/usage-with-typescript#typing-query-and-mutation-endpoints
    // <ResultType, QueryArg>
    getDefaultAnimalBreeds: build.query<DefaultAnimalBreed[], void>({
      query: () => `${defaultAnimalBreedsUrl}`,
      providesTags: ['DefaultAnimalBreeds'],
    }),
    getAnimalSexes: build.query<AnimalSex[], void>({
      query: () => `${animalSexesUrl}`,
      providesTags: ['AnimalSexes'],
    }),
    getAnimalIdentifierTypes: build.query<AnimalIdentifierType[], void>({
      query: () => `${animalIdentifierTypesUrl}`,
      providesTags: ['AnimalIdentifierTypes'],
    }),
    getAnimalIdentifierColors: build.query<AnimalIdentifierColor[], void>({
      query: () => `${animalIdentifierColorsUrl}`,
      providesTags: ['AnimalIdentifierColors'],
    }),
    getAnimalMovementPurposes: build.query<AnimalMovementPurpose[], void>({
      query: () => `${animalMovementPurposesUrl}`,
      providesTags: ['AnimalMovementPurposes'],
    }),
    getAnimalOrigins: build.query<AnimalOrigin[], void>({
      query: () => `${animalOriginsUrl}`,
      providesTags: ['AnimalOrigins'],
    }),
    getAnimalUses: build.query<AnimalUse[], void>({
      query: () => `${animalUsesUrl}`,
      providesTags: ['AnimalUses'],
    }),
    getAnimalRemovalReasons: build.query<AnimalRemovalReason[], void>({
      query: () => `${animalRemovalReasonsUrl}`,
      providesTags: ['AnimalRemovalReasons'],
    }),
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
  }),
});

export const {
  useGetDefaultAnimalBreedsQuery,
  useGetAnimalSexesQuery,
  useGetAnimalIdentifierTypesQuery,
  useGetAnimalIdentifierColorsQuery,
  useGetAnimalMovementPurposesQuery,
  useGetAnimalOriginsQuery,
  useGetAnimalUsesQuery,
  useGetAnimalRemovalReasonsQuery,
  useGetSoilAmendmentMethodsQuery,
  useGetSoilAmendmentPurposesQuery,
  useGetSoilAmendmentFertiliserTypesQuery,
} = libraryApi;
