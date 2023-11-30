/*
 *  Copyright 2023 LiteFarm.org
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
import {
  cropURL,
  cropVarietyURL,
  expenseTypeUrl,
  expenseUrl,
  managementPlanURL,
  revenueTypeUrl,
  salesURL,
  taskTypeUrl,
  taskUrl,
  url,
} from '../../apiConfig';

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: url,
    prepareHeaders: (headers, { getState }) => {
      headers.set('Content-Type', 'application/json');
      headers.set('Authorization', `Bearer ${localStorage.getItem('id_token')}`);
      headers.set('user_id', getState().entitiesReducer.userFarmReducer.user_id);
      headers.set('farm_id', getState().entitiesReducer.userFarmReducer.farm_id);

      return headers;
    },
    responseHandler: 'content-type',
  }),
  tagTypes: ['Sale', 'Expense'],
  endpoints: (build) => ({
    getSales: build.query({
      query: (farmId) => `${salesURL}/${farmId}`,
      providesTags: ['Sale'],
    }),
    getExpenses: build.query({
      query: (farmId) => `${expenseUrl}/farm/${farmId}`,
      providesTags: ['Expense'],
    }),
    getExpenseTypes: build.query({
      query: (farmId) => `${expenseTypeUrl}/farm/${farmId}`,
    }),
    getRevenueTypes: build.query({
      query: (farmId) => `${revenueTypeUrl}/farm/${farmId}`,
    }),
    getTasks: build.query({
      query: (farmId) => `${taskUrl}/${farmId}`,
    }),
    getTaskTypes: build.query({
      query: (farmId) => `${taskTypeUrl}/farm/${farmId}`,
    }),
    getCropVarieties: build.query({
      query: (farmId) => `${cropVarietyURL}/farm/${farmId}`,
    }),
    getCrops: build.query({
      query: (farmId) => `${cropURL}/farm/${farmId}?fetch_all=false`,
    }),
    getManagementPlans: build.query({
      query: (farmId) => `${managementPlanURL}/farm/${farmId}`,
    }),
    addSale: build.mutation({
      query: (sale) => ({ url: salesURL, method: 'POST', body: sale }),
      invalidatesTags: ['Sale'],
    }),
    addExpenses: build.mutation({
      query: ({ farmId, expenses }) => {
        return {
          url: `${expenseUrl}/farm/${farmId}`,
          method: 'POST',
          body: expenses,
        };
      },
      invalidatesTags: ['Expense'],
    }),
  }),
});

export const {
  useGetSalesQuery,
  useGetExpensesQuery,
  useGetExpenseTypesQuery,
  useGetRevenueTypesQuery,
  useGetTasksQuery,
  useGetTaskTypesQuery,
  useGetCropVarietiesQuery,
  useGetCropsQuery,
  useGetManagementPlansQuery,
  useAddSaleMutation,
  useAddExpensesMutation,
} = api;
