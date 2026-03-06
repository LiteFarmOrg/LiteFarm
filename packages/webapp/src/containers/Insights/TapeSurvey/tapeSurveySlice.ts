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
  surveyDataInProgress: Record<string, any>;
  submissionType?: 'baseline' | 'update' | 'retake';
}

const initialState: TapeSurveyState = {
  currentPageNo: 0,
  surveyDataInProgress: {},
  submissionType: undefined,
};

const tapeSurveySlice = createSlice({
  name: 'tapeSurveyReducer',
  initialState,
  reducers: {
    saveSurveyProgress: (
      state,
      action: PayloadAction<{
        currentPageNo: number;
        surveyData: Record<string, any>;
        submissionType?: TapeSurveyState['submissionType'];
      }>,
    ) => {
      state.currentPageNo = action.payload.currentPageNo;
      state.surveyDataInProgress = { ...state.surveyDataInProgress, ...action.payload.surveyData };
      if (action.payload.submissionType) {
        state.submissionType = action.payload.submissionType;
      }
    },
    reopenSurvey: (state) => {
      state.currentPageNo = 0;
    },
    clearSurvey: () => initialState,
  },
});

export const { saveSurveyProgress, reopenSurvey, clearSurvey } = tapeSurveySlice.actions;
export default tapeSurveySlice.reducer;

// Selectors
export const tapeSurveySelector = (state: any) =>
  // Re-evaluate placement in farmStateReducer when adding backend
  state.farmStateReducer[tapeSurveySlice.name] || initialState;

export const tapeSurveyStatusSelector = createSelector([tapeSurveySelector], (tapeSurvey) => ({
  inProgress: Object.keys(tapeSurvey.surveyDataInProgress).length > 0,
}));
