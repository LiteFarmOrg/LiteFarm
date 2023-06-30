/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
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
import { createSelector } from 'reselect';

export const initialState = {
  selectOptions: {},
  codeById: {},
};

const countrySlice = createSlice({
  name: 'countryReducer',
  initialState,
  reducers: {
    getCountriesCodeSuccess: (state, { payload: { options, map, language } }) => {
      const countryNameKey = `country_name_${language}`;
      state.selectOptions[language] = options;
      if (!Object.keys(state.codeById).length) {
        state.codeById = map;
        return;
      }
      Object.keys(map).forEach((id) => {
        state.codeById[id][countryNameKey] = map[id][countryNameKey];
      });
    },
  },
});

export const { getCountriesCodeSuccess } = countrySlice.actions;
export default countrySlice.reducer;

export const countryReducerSelector = (state) => state.entitiesReducer[countrySlice.name];
export const countrySelectOptionsSelector = createSelector(
  countryReducerSelector,
  (countryReducer) => countryReducer.selectOptions,
);

export const countryCodeByIdSelector = createSelector(
  countryReducerSelector,
  (countryReducer) => countryReducer.codeById,
);
