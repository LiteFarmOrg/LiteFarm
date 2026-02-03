/*
 *  Copyright 2022 - 2026 LiteFarm.org
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

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  fieldWorkTypes: [],
};

const fieldWorkTypeSlice = createSlice({
  name: 'fieldWorkTypeReducer',
  initialState,
  reducers: {
    resetFieldWorkTypeStates: (state, action) => {
      Object.assign(state, {
        loading: false,
        fieldWorkTypes: [],
      });
    },
    fieldWorkTypeLoading: (state, action) => {
      Object.assign(state, {
        loading: true,
      });
    },
    fieldWorkTypeSuccess: (state, { payload }) => {
      if (state.loading && payload?.fieldWorkTypes?.length) {
        Object.assign(state, {
          loading: false,
          fieldWorkTypes: payload?.fieldWorkTypes,
        });
      }
    },
    fieldWorkTypeFailure: (state, action) => {
      state.loading = true;
    },
  },
});
export const {
  resetFieldWorkTypeStates,
  fieldWorkTypeLoading,
  fieldWorkTypeSuccess,
  fieldWorkTypeFailure,
} = fieldWorkTypeSlice.actions;
export default fieldWorkTypeSlice.reducer;
export const fieldWorkTypeSliceSelector = (state) => {
  return state?.entitiesReducer[fieldWorkTypeSlice.name];
};
