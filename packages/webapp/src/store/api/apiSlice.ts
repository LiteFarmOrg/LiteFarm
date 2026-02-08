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
  IrrigationPrescriptionDetails,
  WithFarmId,
  WithFarmIdPayload,
} from './types';

import { addDaysToDate } from '../../util/date';
import { API_TAGS, ApiTag } from './apiTags';
import {
  getFarmTagsFn,
  getLazyUseQueryWithFarmId,
  getMutationWithFarmId,
  getUseQueryWithFarmId,
} from './util';

/**
 * Invalidates one or more RTK Query cache tags.
 *
 * This helper provides a type-safe wrapper around `api.util.invalidateTags`
 * ensuring only valid `ApiTag` values (defined in `API_TAGS`) can be used.
 *
 * @param {ApiTag[]} tags - An array of tag names to invalidate.
 * @returns - The invalidateTags action,
 * which can be dispatched directly or used inside a saga (e.g., `yield put(...)`).
 */
export const invalidateTags = (tags: ApiTag[]) => api.util.invalidateTags(tags);

const NON_JSON_ENDPOINT_KEYS = new Set(['addSupportTicket']);

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: url,
    prepareHeaders: (headers, { getState, endpoint }) => {
      const state = getState() as RootState;

      headers.set('Authorization', `Bearer ${localStorage.getItem('id_token')}`);
      headers.set('user_id', state.entitiesReducer.userFarmReducer.user_id || '');
      headers.set('farm_id', state.entitiesReducer.userFarmReducer.farm_id || '');

      // Only set the content-type to json if appropriate.
      if (!NON_JSON_ENDPOINT_KEYS.has(endpoint) && !headers.has('Content-Type')) {
        headers.set('content-type', 'application/json');
      }

      return headers;
    },
    responseHandler: 'content-type',
  }),
  tagTypes: API_TAGS,
  keepUnusedDataFor: 60 * 60 * 24 * 7, // 7 days
  refetchOnMountOrArgChange: 60,
  endpoints: (build) => ({
    // redux-toolkit.js.org/rtk-query/usage-with-typescript#typing-query-and-mutation-endpoints
    // <ResultType, QueryArg>
    getAnimals: build.query<Animal[], WithFarmId>({
      query: (_args) => `${animalsUrl}`,
      providesTags: getFarmTagsFn<Animal[], WithFarmId>(['Animals']),
    }),
    getAnimalBatches: build.query<AnimalBatch[], WithFarmId>({
      query: (_args) => `${animalBatchesUrl}`,
      providesTags: getFarmTagsFn<AnimalBatch[], WithFarmId>(['AnimalBatches']),
    }),
    getDefaultAnimalTypes: build.query<DefaultAnimalType[], WithFarmId<{ param?: string | void }>>({
      query: ({ param = '' }) => `${defaultAnimalTypesUrl}${param}`,
      providesTags: getFarmTagsFn<DefaultAnimalType[], WithFarmId>(['DefaultAnimalTypes']),
    }),
    getCustomAnimalTypes: build.query<CustomAnimalType[], WithFarmId<{ param?: string | void }>>({
      query: ({ param = '' }) => `${customAnimalTypesUrl}${param}`,
      providesTags: getFarmTagsFn<CustomAnimalType[], WithFarmId>(['CustomAnimalTypes']),
    }),
    getCustomAnimalBreeds: build.query<CustomAnimalBreed[], WithFarmId>({
      query: (_args) => `${customAnimalBreedsUrl}`,
      providesTags: getFarmTagsFn<CustomAnimalBreed[], WithFarmId>(['CustomAnimalBreeds']),
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
    removeAnimals: build.mutation<Animal[], WithFarmIdPayload<Partial<Animal>[]>>({
      query: ({ farm_id: _farm_id, payload: patch }) => ({
        url: `${animalsUrl}/remove`,
        method: 'PATCH',
        body: patch,
      }),
      async onQueryStarted(patch, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          await dispatch(api.endpoints.getAnimals.initiate());
          await dispatch(api.endpoints.getCustomAnimalTypes.initiate());
          await dispatch(api.endpoints.getCustomAnimalTypes.initiate('?count=true'));
          await dispatch(api.endpoints.getDefaultAnimalTypes.initiate());
          await dispatch(api.endpoints.getDefaultAnimalTypes.initiate('?count=true'));
        } catch (err) {
          // handled in component
        }
      },
      invalidatesTags: getFarmTagsFn<Animal[], WithFarmIdPayload<Partial<Animal>[]>>([
        'Animals',
        'CustomAnimalTypes',
        'DefaultAnimalTypes',
      ]),
    }),
    removeAnimalBatches: build.mutation<AnimalBatch[], WithFarmIdPayload<Partial<AnimalBatch>[]>>({
      query: ({ farm_id: _farm_id, payload: patch }) => ({
        url: `${animalBatchesUrl}/remove`,
        method: 'PATCH',
        body: patch,
      }),
      async onQueryStarted(patch, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          await dispatch(api.endpoints.getAnimalBatches.initiate());
          await dispatch(api.endpoints.getCustomAnimalTypes.initiate());
          await dispatch(api.endpoints.getCustomAnimalTypes.initiate('?count=true'));
          await dispatch(api.endpoints.getDefaultAnimalTypes.initiate());
          await dispatch(api.endpoints.getDefaultAnimalTypes.initiate('?count=true'));
        } catch (err) {
          // handled in component
        }
      },
      invalidatesTags: getFarmTagsFn<AnimalBatch[], WithFarmIdPayload<Partial<AnimalBatch>[]>>([
        'AnimalBatches',
        'CustomAnimalTypes',
        'DefaultAnimalTypes',
      ]),
    }),
    deleteAnimals: build.mutation<Animal[], WithFarmIdPayload<number[]>>({
      query: ({ farm_id: _farm_id, payload: del }) => ({
        url: `${animalsUrl}`,
        method: 'DELETE',
        params: del,
      }),
      async onQueryStarted(del, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          await dispatch(api.endpoints.getAnimals.initiate());
          await dispatch(api.endpoints.getCustomAnimalTypes.initiate());
          await dispatch(api.endpoints.getCustomAnimalTypes.initiate('?count=true'));
          await dispatch(api.endpoints.getDefaultAnimalTypes.initiate());
          await dispatch(api.endpoints.getDefaultAnimalTypes.initiate('?count=true'));
        } catch (err) {
          // handled in component
        }
      },
      invalidatesTags: getFarmTagsFn<Animal[], WithFarmIdPayload<number[]>>([
        'Animals',
        'CustomAnimalTypes',
        'DefaultAnimalTypes',
      ]),
    }),
    deleteAnimalBatches: build.mutation<AnimalBatch[], WithFarmIdPayload<number[]>>({
      query: ({ farm_id: _farm_id, payload: del }) => ({
        url: `${animalBatchesUrl}`,
        method: 'DELETE',
        params: del,
      }),
      async onQueryStarted(del, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          await dispatch(api.endpoints.getAnimalBatches.initiate());
          await dispatch(api.endpoints.getCustomAnimalTypes.initiate());
          await dispatch(api.endpoints.getCustomAnimalTypes.initiate('?count=true'));
          await dispatch(api.endpoints.getDefaultAnimalTypes.initiate());
          await dispatch(api.endpoints.getDefaultAnimalTypes.initiate('?count=true'));
        } catch (err) {
          // handled in component
        }
      },
      invalidatesTags: getFarmTagsFn<AnimalBatch[], WithFarmIdPayload<number[]>>([
        'AnimalBatches',
        'CustomAnimalTypes',
        'DefaultAnimalTypes',
      ]),
    }),
    addAnimals: build.mutation<Animal[], WithFarmIdPayload<Partial<Animal>[]>>({
      query: ({ farm_id: _farm_id, payload: body }) => ({
        url: `${animalsUrl}`,
        method: 'POST',
        body,
      }),
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          await dispatch(api.endpoints.getAnimals.initiate());
          await dispatch(api.endpoints.getDefaultAnimalTypes.initiate());
          await dispatch(api.endpoints.getDefaultAnimalTypes.initiate('?count=true'));
          await dispatch(api.endpoints.getCustomAnimalTypes.initiate());
          await dispatch(api.endpoints.getCustomAnimalTypes.initiate('?count=true'));
          await dispatch(api.endpoints.getCustomAnimalBreeds.initiate());
        } catch (err) {
          // handled in component
        }
      },
      invalidatesTags: getFarmTagsFn<Animal[], WithFarmIdPayload<Partial<Animal>[]>>([
        'Animals',
        'DefaultAnimalTypes',
        'CustomAnimalTypes',
        'CustomAnimalBreeds',
      ]),
    }),
    addAnimalBatches: build.mutation<AnimalBatch[], WithFarmIdPayload<Partial<AnimalBatch>[]>>({
      query: ({ farm_id: _farm_id, payload: body }) => ({
        url: `${animalBatchesUrl}`,
        method: 'POST',
        body,
      }),
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          await dispatch(api.endpoints.getAnimalBatches.initiate());
          await dispatch(api.endpoints.getDefaultAnimalTypes.initiate());
          await dispatch(api.endpoints.getDefaultAnimalTypes.initiate('?count=true'));
          await dispatch(api.endpoints.getCustomAnimalTypes.initiate());
          await dispatch(api.endpoints.getCustomAnimalTypes.initiate('?count=true'));
          await dispatch(api.endpoints.getCustomAnimalBreeds.initiate());
        } catch (err) {
          // handled in component
        }
      },
      invalidatesTags: getFarmTagsFn<AnimalBatch[], WithFarmIdPayload<Partial<AnimalBatch>[]>>([
        'AnimalBatches',
        'DefaultAnimalTypes',
        'CustomAnimalTypes',
        'CustomAnimalBreeds',
      ]),
    }),
    updateAnimals: build.mutation<void, WithFarmIdPayload<Partial<Animal>[]>>({
      query: ({ farm_id: _farm_id, payload: body }) => ({
        url: `${animalsUrl}`,
        method: 'PATCH',
        body,
      }),
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          await dispatch(api.endpoints.getAnimals.initiate());
          await dispatch(api.endpoints.getDefaultAnimalTypes.initiate());
          await dispatch(api.endpoints.getDefaultAnimalTypes.initiate('?count=true'));
          await dispatch(api.endpoints.getCustomAnimalTypes.initiate());
          await dispatch(api.endpoints.getCustomAnimalTypes.initiate('?count=true'));
          await dispatch(api.endpoints.getCustomAnimalBreeds.initiate());
        } catch (err) {
          // handled in component
        }
      },
      invalidatesTags: getFarmTagsFn<void, WithFarmIdPayload<Partial<Animal>[]>>([
        'Animals',
        'DefaultAnimalTypes',
        'CustomAnimalTypes',
        'CustomAnimalBreeds',
      ]),
    }),
    updateAnimalBatches: build.mutation<void, WithFarmIdPayload<Partial<AnimalBatch>[]>>({
      query: ({ farm_id: _farm_id, payload: body }) => ({
        url: `${animalBatchesUrl}`,
        method: 'PATCH',
        body,
      }),
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          await dispatch(api.endpoints.getAnimalBatches.initiate());
          await dispatch(api.endpoints.getDefaultAnimalTypes.initiate());
          await dispatch(api.endpoints.getDefaultAnimalTypes.initiate('?count=true'));
          await dispatch(api.endpoints.getCustomAnimalTypes.initiate());
          await dispatch(api.endpoints.getCustomAnimalTypes.initiate('?count=true'));
          await dispatch(api.endpoints.getCustomAnimalBreeds.initiate());
        } catch (err) {
          // handled in component
        }
      },
      invalidatesTags: getFarmTagsFn<void, WithFarmIdPayload<Partial<AnimalBatch>[]>>([
        'AnimalBatches',
        'DefaultAnimalTypes',
        'CustomAnimalTypes',
        'CustomAnimalBreeds',
      ]),
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
    addSoilAmendmentProduct: build.mutation<
      SoilAmendmentProduct,
      WithFarmIdPayload<Partial<SoilAmendmentProduct>>
    >({
      query: ({ farm_id: _farm_id, payload: body }) => ({
        url: `${productUrl}`,
        method: 'POST',
        body,
      }),
    }),
    updateSoilAmendmentProduct: build.mutation<
      SoilAmendmentProduct,
      WithFarmIdPayload<Partial<SoilAmendmentProduct>>
    >({
      query: ({ farm_id: _farm_id, payload: { product_id, ...patch } }) => ({
        url: `${productUrl}/${product_id}`,
        method: 'PATCH',
        body: patch,
      }),
    }),
    deleteSoilAmendmentProduct: build.mutation<
      void,
      WithFarmIdPayload<SoilAmendmentProduct['product_id']>
    >({
      query: ({ farm_id: _farm_id, payload: productId }) => ({
        url: `${productUrl}/${productId}`,
        method: 'DELETE',
      }),
    }),
    getSensors: build.query<SensorData, WithFarmId>({
      query: (_args) => `${sensorUrl}`,
      keepUnusedDataFor: 60 * 60 * 24 * 365, // 1 year
      providesTags: getFarmTagsFn<SensorData, WithFarmId>(['Sensors']),
    }),
    getSensorReadings: build.query<
      SensorReadings[],
      WithFarmId<{
        esids: string; // as comma separated values e.g. 'LSZDWX,WV2JHV'
        startTime?: string; // ISO 8601
        endTime?: string; // ISO 8601
        truncPeriod?: 'minute' | 'hour' | 'day';
      }>
    >({
      query: ({ esids, startTime, endTime, truncPeriod }) => {
        const params = new URLSearchParams({ esids });
        if (startTime) params.append('startTime', startTime);
        if (endTime) params.append('endTime', endTime);
        if (truncPeriod) params.append('truncPeriod', truncPeriod);
        return `${sensorUrl}/readings?${params.toString()}`;
      },
      providesTags: getFarmTagsFn<
        SensorReadings[],
        WithFarmId<{
          esids: string; // as comma separated values e.g. 'LSZDWX,WV2JHV'
          startTime?: string; // ISO 8601
          endTime?: string; // ISO 8601
          truncPeriod?: 'minute' | 'hour' | 'day';
        }>
      >(['SensorReadings']),
    }),
    addFarmAddon: build.mutation<void, WithFarmIdPayload<FarmAddon>>({
      query: ({ farm_id: _farm_id, payload: body }) => ({
        url: `${farmAddonUrl}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: getFarmTagsFn<void, WithFarmIdPayload<FarmAddon>>(['FarmAddon']),
    }),
    getFarmAddon: build.query<FarmAddon[], WithFarmId<{ param: string | void }>>({
      query: ({ param = '' }) => `${farmAddonUrl}${param}`,
      providesTags: getFarmTagsFn<FarmAddon[], WithFarmId<{ param: string | void }>>(['FarmAddon']),
    }),
    deleteFarmAddon: build.mutation<void, WithFarmIdPayload<number>>({
      query: ({ farm_id: _farm_id, payload: id }) => ({
        url: `${farmAddonUrl}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, error, args) =>
        error
          ? []
          : getFarmTagsFn<void, WithFarmIdPayload<number>>([
              'FarmAddon',
              'Sensors',
              'SensorReadings',
            ])(_result, error, args),
    }),
    getIrrigationPrescriptions: build.query<IrrigationPrescription[], WithFarmId>({
      query: (_args) => {
        const today = new Date();
        const startDate = today.toISOString().split('T')[0];
        const endDate = addDaysToDate(today, 1).toISOString().split('T')[0];
        const params = new URLSearchParams({ startTime: startDate, endTime: endDate });

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
      providesTags: getFarmTagsFn<IrrigationPrescription[], WithFarmId>([
        'IrrigationPrescriptions',
      ]),
    }),
    getIrrigationPrescriptionDetails: build.query<
      IrrigationPrescriptionDetails,
      WithFarmId<{ id: number }>
    >({
      query: ({ id }) => `${irrigationPrescriptionUrl}/${id}`,
      providesTags: getFarmTagsFn<IrrigationPrescriptionDetails, WithFarmId<{ id: number }>>([
        'IrrigationPrescriptionDetails',
      ]),
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
} = api;

// Farm tag endpoints
export const useGetAnimalsQuery = getUseQueryWithFarmId<Animal[], WithFarmId>(
  api.useGetAnimalsQuery,
);
export const useGetAnimalBatchesQuery = getUseQueryWithFarmId<AnimalBatch[], WithFarmId>(
  api.useGetAnimalBatchesQuery,
);
export const useGetDefaultAnimalTypesQuery = getUseQueryWithFarmId<
  DefaultAnimalType[],
  WithFarmId<{ param?: string | void }>
>(api.useGetDefaultAnimalTypesQuery);

export const useGetCustomAnimalTypesQuery = getUseQueryWithFarmId<
  CustomAnimalType[],
  WithFarmId<{ param?: string | void }>
>(api.useGetCustomAnimalTypesQuery);
export const useGetCustomAnimalBreedsQuery = getUseQueryWithFarmId<CustomAnimalBreed[], WithFarmId>(
  api.useGetCustomAnimalBreedsQuery,
);
export const useGetFarmAddonQuery = getUseQueryWithFarmId<
  FarmAddon[],
  WithFarmId<{ param: string | void }>
>(api.useGetFarmAddonQuery);
export const useGetIrrigationPrescriptionsQuery = getUseQueryWithFarmId<
  IrrigationPrescription[],
  WithFarmId
>(api.useGetIrrigationPrescriptionsQuery);
export const useGetIrrigationPrescriptionDetailsQuery = getUseQueryWithFarmId<
  IrrigationPrescriptionDetails,
  WithFarmId<{ id: number }>
>(api.useGetIrrigationPrescriptionDetailsQuery);
export const useGetSensorsQuery = getUseQueryWithFarmId<SensorData, WithFarmId>(
  api.useGetSensorsQuery,
);
export const useGetSensorReadingsQuery = getUseQueryWithFarmId<
  SensorReadings[],
  WithFarmId<{
    esids: string; // as comma separated values e.g. 'LSZDWX,WV2JHV'
    startTime?: string; // ISO 8601
    endTime?: string; // ISO 8601
    truncPeriod?: 'minute' | 'hour' | 'day';
  }>
>(api.useGetSensorReadingsQuery);

export const useLazyGetSensorsQuery = getLazyUseQueryWithFarmId<SensorData, WithFarmId>(
  api.useLazyGetSensorsQuery,
);

export const useLazyGetSensorReadingsQuery = getLazyUseQueryWithFarmId<
  SensorReadings[],
  WithFarmId<{
    esids: string; // as comma separated values e.g. 'LSZDWX,WV2JHV'
    startTime?: string; // ISO 8601
    endTime?: string; // ISO 8601
    truncPeriod?: 'minute' | 'hour' | 'day';
  }>
>(api.useLazyGetSensorReadingsQuery);

// Mutations wrapped with getMutationWithFarmId
export const useRemoveAnimalsMutation = getMutationWithFarmId<
  Animal[],
  WithFarmIdPayload<Partial<Animal>[]>
>(api.useRemoveAnimalsMutation);

export const useRemoveAnimalBatchesMutation = getMutationWithFarmId<
  AnimalBatch[],
  WithFarmIdPayload<Partial<AnimalBatch>[]>
>(api.useRemoveAnimalBatchesMutation);

export const useDeleteAnimalsMutation = getMutationWithFarmId<
  Animal[],
  WithFarmIdPayload<number[]>
>(api.useDeleteAnimalsMutation);

export const useDeleteAnimalBatchesMutation = getMutationWithFarmId<
  AnimalBatch[],
  WithFarmIdPayload<number[]>
>(api.useDeleteAnimalBatchesMutation);

export const useAddAnimalsMutation = getMutationWithFarmId<
  Animal[],
  WithFarmIdPayload<Partial<Animal>[]>
>(api.useAddAnimalsMutation);

export const useAddAnimalBatchesMutation = getMutationWithFarmId<
  AnimalBatch[],
  WithFarmIdPayload<Partial<AnimalBatch>[]>
>(api.useAddAnimalBatchesMutation);

export const useUpdateAnimalsMutation = getMutationWithFarmId<
  void,
  WithFarmIdPayload<Partial<Animal>[]>
>(api.useUpdateAnimalsMutation);

export const useUpdateAnimalBatchesMutation = getMutationWithFarmId<
  void,
  WithFarmIdPayload<Partial<AnimalBatch>[]>
>(api.useUpdateAnimalBatchesMutation);

export const useAddSoilAmendmentProductMutation = getMutationWithFarmId<
  SoilAmendmentProduct,
  WithFarmIdPayload<Partial<SoilAmendmentProduct>>
>(api.useAddSoilAmendmentProductMutation);

export const useUpdateSoilAmendmentProductMutation = getMutationWithFarmId<
  SoilAmendmentProduct,
  WithFarmIdPayload<Partial<SoilAmendmentProduct>>
>(api.useUpdateSoilAmendmentProductMutation);

export const useDeleteSoilAmendmentProductMutation = getMutationWithFarmId<
  void,
  WithFarmIdPayload<SoilAmendmentProduct['product_id']>
>(api.useDeleteSoilAmendmentProductMutation);

export const useAddFarmAddonMutation = getMutationWithFarmId<void, WithFarmIdPayload<FarmAddon>>(
  api.useAddFarmAddonMutation,
);

export const useDeleteFarmAddonMutation = getMutationWithFarmId<void, WithFarmIdPayload<number>>(
  api.useDeleteFarmAddonMutation,
);
