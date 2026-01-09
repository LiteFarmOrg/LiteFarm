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

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';

interface TapeSurveyState {
  currentPageNo: number;
  surveyData: Record<string, any>;
  isCompleted: boolean;
}

const initialState: TapeSurveyState = {
  currentPageNo: 0,
  surveyData: {},
  isCompleted: false,
};

const tapeSurveySlice = createSlice({
  name: 'tapeSurveyReducer',
  initialState,
  reducers: {
    saveSurveyProgress: (
      state,
      action: PayloadAction<{ currentPageNo: number; surveyData: Record<string, any> }>,
    ) => {
      state.currentPageNo = action.payload.currentPageNo;
      state.surveyData = { ...state.surveyData, ...action.payload.surveyData };
    },
    completeSurvey: (state, action: PayloadAction<Record<string, any>>) => {
      state.surveyData = action.payload;
      state.isCompleted = true;
    },
    clearSurvey: () => initialState,
  },
});

export const { saveSurveyProgress, completeSurvey, clearSurvey } = tapeSurveySlice.actions;
export default tapeSurveySlice.reducer;

// Selectors
export const tapeSurveyReducerSelector = (state: any) =>
  state.entitiesReducer[tapeSurveySlice.name];

export const tapeSurveyDataSelector = createSelector(
  [tapeSurveyReducerSelector],
  (tapeSurvey) => tapeSurvey?.surveyData || {},
);

export const tapeSurveyCurrentPageNoSelector = createSelector(
  [tapeSurveyReducerSelector],
  (tapeSurvey) => tapeSurvey?.currentPageNo || 0,
);

export const tapeSurveyIsCompletedSelector = createSelector(
  [tapeSurveyReducerSelector],
  (tapeSurvey) => tapeSurvey?.isCompleted || false,
);

export const tapeSurveyStatusSelector = createSelector(
  [tapeSurveyReducerSelector],
  (tapeSurvey) => ({
    isCompleted: tapeSurvey?.isCompleted || false,
    hasData: Object.keys(tapeSurvey?.surveyData || {}).length > 0,
  }),
);
