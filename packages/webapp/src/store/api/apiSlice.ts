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
  customAnimalBreedsUrl,
  customAnimalTypesUrl,
  defaultAnimalBreedsUrl,
  defaultAnimalTypesUrl,
  animalSexesUrl,
  animalIdentifierTypesUrl,
  animalIdentifierColorsUrl,
  animalOriginsUrl,
  animalUsesUrl,
  animalRemovalReasonsUrl,
  soilAmendmentMethodsUrl,
  soilAmendmentPurposesUrl,
  soilAmendmentFertiliserTypesUrl,
  productUrl,
  url,
  animalMovementPurposesUrl,
  sensorUrl,
  farmAddonUrl,
  irrigationPrescriptionUrl,
} from '../../apiConfig';
import type {
  Animal,
  AnimalBatch,
  CustomAnimalBreed,
  CustomAnimalType,
  DefaultAnimalBreed,
  DefaultAnimalType,
  AnimalSex,
  AnimalRemovalReason,
  SoilAmendmentMethod,
  SoilAmendmentPurpose,
  SoilAmendmentFertiliserType,
  SoilAmendmentProduct,
  AnimalIdentifierType,
  AnimalIdentifierColor,
  AnimalOrigin,
  AnimalUse,
  AnimalMovementPurpose,
  SensorData,
  FarmAddon,
  SensorReadings,
  IrrigationPrescription,
} from './types';

/**
 * These tags have endpoints that do not return farm specific data, and are not created by a farm
 *
 *  LiteFarm provides these data as defaults
 */
export const LibraryTags = [
  'AnimalSexes',
  'AnimalIdentifierTypes',
  'AnimalIdentifierColors',
  'AnimalMovementPurposes',
  'AnimalOrigins',
  'AnimalUses',
  'AnimalRemovalReasons',
  'DefaultAnimalBreeds',
  'SoilAmendmentMethods',
  'SoilAmendmentPurposes',
  'SoilAmendmentFertiliserTypes',
];

/**
 * These tags contain endpoints that return farm specific data
 *
 * These data should not persist when switching farms,
 * or should be stored in a separate farm store.
 */
export const FarmTags = [
  'Animals',
  'AnimalBatches',
  'CustomAnimalBreeds',
  'CustomAnimalTypes',
  'FarmAddon',
  'IrrigationPrescriptions',
  'SoilAmendmentProduct',
  'Sensors',
  'SensorReadings',
  'Weather',
];

/**
 * These tags contain endpoints that could either return farm specific data
 * or farm neutral defaults data.
 *
 * For data safety these data should also not persist when switching farms,
 * or should be stored in a separate farm store.
 */
export const FarmLibraryTags = [
  // 'count' param returns farm specific data
  'DefaultAnimalTypes',
];
import { addDaysToDate } from '../../util/date';
import { getEndOfDate, getStartOfDate } from '../../util/date-migrate-TS';

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
  tagTypes: [...LibraryTags, ...FarmTags, ...FarmLibraryTags],
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
    removeAnimals: build.mutation<Animal[], Partial<Animal>[]>({
      query: (patch) => ({
        url: `${animalsUrl}/remove`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['Animals', 'CustomAnimalTypes', 'DefaultAnimalTypes'],
    }),
    removeAnimalBatches: build.mutation<AnimalBatch[], Partial<AnimalBatch>[]>({
      query: (patch) => ({
        url: `${animalBatchesUrl}/remove`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['AnimalBatches', 'CustomAnimalTypes', 'DefaultAnimalTypes'],
    }),
    deleteAnimals: build.mutation<Animal[], number[]>({
      query: (del) => ({
        url: `${animalsUrl}`,
        method: 'DELETE',
        params: del,
      }),
      invalidatesTags: ['Animals', 'CustomAnimalTypes', 'DefaultAnimalTypes'],
    }),
    deleteAnimalBatches: build.mutation<AnimalBatch[], number[]>({
      query: (del) => ({
        url: `${animalBatchesUrl}`,
        method: 'DELETE',
        params: del,
      }),
      invalidatesTags: ['AnimalBatches', 'CustomAnimalTypes', 'DefaultAnimalTypes'],
    }),
    addAnimals: build.mutation<Animal[], Partial<Animal>[]>({
      query: (body) => ({
        url: `${animalsUrl}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Animals', 'DefaultAnimalTypes', 'CustomAnimalTypes', 'CustomAnimalBreeds'],
    }),
    addAnimalBatches: build.mutation<AnimalBatch[], Partial<AnimalBatch>[]>({
      query: (body) => ({
        url: `${animalBatchesUrl}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        'AnimalBatches',
        'DefaultAnimalTypes',
        'CustomAnimalTypes',
        'CustomAnimalBreeds',
      ],
    }),
    updateAnimals: build.mutation<void, Partial<Animal>[]>({
      query: (body) => ({ url: `${animalsUrl}`, method: 'PATCH', body }),
      invalidatesTags: ['Animals', 'DefaultAnimalTypes', 'CustomAnimalTypes', 'CustomAnimalBreeds'],
    }),
    updateAnimalBatches: build.mutation<void, Partial<AnimalBatch>[]>({
      query: (body) => ({ url: `${animalBatchesUrl}`, method: 'PATCH', body }),
      invalidatesTags: [
        'AnimalBatches',
        'DefaultAnimalTypes',
        'CustomAnimalTypes',
        'CustomAnimalBreeds',
      ],
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
    getSensors: build.query<SensorData, void>({
      query: () => `${sensorUrl}`,
      keepUnusedDataFor: 60 * 60 * 24 * 365, // 1 year
      providesTags: ['Sensors'],
    }),
    getSensorReadings: build.query<
      SensorReadings[],
      {
        esids: string; // as comma separated values e.g. 'LSZDWX,WV2JHV'
        startTime?: string; // ISO 8601
        endTime?: string; // ISO 8601
        truncPeriod?: 'minute' | 'hour' | 'day';
      }
    >({
      query: ({ esids, startTime, endTime, truncPeriod }) => {
        const params = new URLSearchParams({ esids });
        if (startTime) params.append('startTime', startTime);
        if (endTime) params.append('endTime', endTime);
        if (truncPeriod) params.append('truncPeriod', truncPeriod);
        return `${sensorUrl}/readings?${params.toString()}`;
      },
      providesTags: ['SensorReadings'],
    }),
    addFarmAddon: build.mutation<void, FarmAddon>({
      query: (body) => ({
        url: `${farmAddonUrl}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FarmAddon'],
    }),
    getFarmAddon: build.query<FarmAddon[], string | void>({
      query: (param = '') => `${farmAddonUrl}${param}`,
      providesTags: ['FarmAddon'],
    }),
    deleteFarmAddon: build.mutation<void, number>({
      query: (id) => ({
        url: `${farmAddonUrl}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, error) =>
        error ? [] : ['FarmAddon', 'Sensors', 'SensorReadings'],
    }),
    getIrrigationPrescriptions: build.query<IrrigationPrescription[], void>({
      query: () => {
        // After date is hard coded for now as the users current locale
        const today = new Date();
        const startTime = getStartOfDate(today).toISOString();
        const endTime = getEndOfDate(addDaysToDate(today, 1)).toISOString();
        const shouldSend = 'false';
        const params = new URLSearchParams({ startTime, endTime, shouldSend });

        return `${irrigationPrescriptionUrl}?${params.toString()}`;
      },
      async onQueryStarted(_id, { dispatch, queryFulfilled }) {
        try {
          // TODO: Once tasks is migrated to rtk use invalidatesTags instead of onQueryStarted'
          dispatch({ type: 'getTasksSaga' });
          await queryFulfilled;
        } catch (error: unknown) {
          // getTasksSaga has its own try/catch block, this error handler will not catch that one
          // @ts-expect-error - error type not definable
          console.error('GET: Irrigation Prescriptions', error?.error ? error.error : error);
        }
      },
      providesTags: ['IrrigationPrescriptions'],
    }),
  }),
});

export const {
  useGetAnimalsQuery,
  useGetAnimalBatchesQuery,
  useGetCustomAnimalBreedsQuery,
  useGetCustomAnimalTypesQuery,
  useGetDefaultAnimalBreedsQuery,
  useGetDefaultAnimalTypesQuery,
  useGetAnimalSexesQuery,
  useGetAnimalIdentifierTypesQuery,
  useGetAnimalIdentifierColorsQuery,
  useGetAnimalMovementPurposesQuery,
  useGetAnimalOriginsQuery,
  useGetAnimalUsesQuery,
  useGetAnimalRemovalReasonsQuery,
  useRemoveAnimalsMutation,
  useRemoveAnimalBatchesMutation,
  useDeleteAnimalsMutation,
  useDeleteAnimalBatchesMutation,
  useAddAnimalsMutation,
  useAddAnimalBatchesMutation,
  useUpdateAnimalsMutation,
  useUpdateAnimalBatchesMutation,
  useGetSoilAmendmentMethodsQuery,
  useGetSoilAmendmentPurposesQuery,
  useGetSoilAmendmentFertiliserTypesQuery,
  useAddSoilAmendmentProductMutation,
  useUpdateSoilAmendmentProductMutation,
  useGetSensorsQuery,
  useGetSensorReadingsQuery,
  useLazyGetSensorsQuery,
  useLazyGetSensorReadingsQuery,
  useAddFarmAddonMutation,
  useGetFarmAddonQuery,
  useDeleteFarmAddonMutation,
  useGetIrrigationPrescriptionsQuery,
} = api;
