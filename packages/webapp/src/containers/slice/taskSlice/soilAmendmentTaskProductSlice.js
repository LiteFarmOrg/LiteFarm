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

import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';

const upsertManySoilAmendmentTaskProduct = (state, { payload: taskProducts }) => {
  soilAmendmentTaskProductAdapter.upsertMany(state, taskProducts);
};

const removeManySoilAmendmentTaskProduct = (state, { payload: idsToRemove }) => {
  soilAmendmentTaskProductAdapter.removeMany(state, idsToRemove);
};

const soilAmendmentTaskProductAdapter = createEntityAdapter({
  selectId: (soilAmendmentTaskProduct) => soilAmendmentTaskProduct.id,
});

const soilAmendmentTaskProductSlice = createSlice({
  name: 'soilAmendmentTaskProductReducer',
  initialState: soilAmendmentTaskProductAdapter.getInitialState({}),
  reducers: {
    getSoilAmendmentTaskProductsSuccess: upsertManySoilAmendmentTaskProduct,
    removeSoilAmendmentTaskProducts: removeManySoilAmendmentTaskProduct,
  },
});

export const { getSoilAmendmentTaskProductsSuccess, removeSoilAmendmentTaskProducts } =
  soilAmendmentTaskProductSlice.actions;

export default soilAmendmentTaskProductSlice.reducer;

export const soilAmendmentTaskProductReducerSelector = (state) =>
  state.entitiesReducer[soilAmendmentTaskProductSlice.name];

const soilAmendmentTaskProductSelectors = soilAmendmentTaskProductAdapter.getSelectors(
  (state) => state.entitiesReducer[soilAmendmentTaskProductSlice.name],
);

export const soilAmendmentTaskProductEntitiesSelector =
  soilAmendmentTaskProductSelectors.selectEntities;

export const soilAmendmentTaskProductStatusSelector = createSelector(
  [soilAmendmentTaskProductReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);

export const soilAmendmentTaskProductsByTaskIdSelector = (taskId) => {
  return createSelector([soilAmendmentTaskProductEntitiesSelector], (entities) => {
    // taskId could be a string or number (should use "==")
    return Object.values(entities).filter((product) => product.task_id == taskId);
  });
};
