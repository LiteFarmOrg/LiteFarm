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

import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart } from './userFarmSlice';
import { pick } from '../util/pick';
import { createSelector } from 'reselect';

export const getRevenueType = (obj) => {
  return pick(obj, [
    'revenue_type_id',
    'revenue_name',
    'revenue_translation_key',
    'farm_id',
    'deleted',
  ]);
};

const addManyRevenueTypes = (state, { payload: revenueTypes }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  revenueTypeAdapter.upsertMany(
    state,
    revenueTypes.map((types) => getRevenueType(types)),
  );
};

const softDeleteRevenueType = (state, { payload: revenue_type_id }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  revenueTypeAdapter.updateOne(state, { id: revenue_type_id, changes: { deleted: true } });
};

const addOneRevenueType = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  revenueTypeAdapter.upsertOne(state, getRevenueType(payload));
};

const updateOneRevenueType = (state, { payload: { revenue_type_id, revenue_name } }) => {
  state.loading = false;
  state.error = null;
  revenueTypeAdapter.updateOne(state, {
    id: revenue_type_id,
    changes: { revenue_name },
  });
};

const revenueTypeAdapter = createEntityAdapter({
  selectId: (revenueType) => revenueType.revenue_type_id,
});

const revenueTypeSlice = createSlice({
  name: 'revenueTypeReducer',
  initialState: revenueTypeAdapter.getInitialState({
    loading: false,
    error: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingRevenueTypeStart: onLoadingStart,
    onLoadingRevenueTypeFail: onLoadingFail,
    getRevenueTypesSuccess: addManyRevenueTypes,
    deleteRevenueTypeSuccess: softDeleteRevenueType,
    postRevenueTypeSuccess: addOneRevenueType,
    putRevenueTypeSuccess: updateOneRevenueType,
  },
});
export const {
  onLoadingRevenueTypeStart,
  onLoadingRevenueTypeFail,
  getRevenueTypesSuccess,
  deleteRevenueTypeSuccess,
  postRevenueTypeSuccess,
  putRevenueTypeSuccess,
} = revenueTypeSlice.actions;

export default revenueTypeSlice.reducer;

export const revenueTypeReducerSelector = (state) => state.entitiesReducer[revenueTypeSlice.name];

const revenueTypeSelectors = revenueTypeAdapter.getSelectors(
  (state) => state.entitiesReducer[revenueTypeSlice.name],
);

export const revenueTypeEntitiesSelector = revenueTypeSelectors.selectEntities;

export const revenueTypesSelector = createSelector(
  [revenueTypeSelectors.selectAll, loginSelector],
  (revenueTypes, { farm_id }) => {
    return revenueTypes.filter(
      (revenue) => (revenue.farm_id === farm_id || !revenue.farm_id) && !revenue.deleted,
    );
  },
);

export const allRevenueTypesSelector = createSelector(
  [revenueTypeSelectors.selectAll, loginSelector],
  (revenueTypes, { farm_id }) => {
    return revenueTypes.filter((revenue) => revenue.farm_id === farm_id || !revenue.farm_id);
  },
);

export const revenueTypeSelector = (revenue_type_id) => (state) =>
  revenueTypeSelectors.selectById(state, revenue_type_id);
