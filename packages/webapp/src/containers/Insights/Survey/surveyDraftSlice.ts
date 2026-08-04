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

interface SurveyDraft {
  currentPageNo: number;
  surveyData: Record<string, any>;
}

interface SurveyDraftState {
  bySurveyId: Record<string, SurveyDraft>;
}

const initialState: SurveyDraftState = {
  bySurveyId: {},
};

const emptyDraft: SurveyDraft = { currentPageNo: 0, surveyData: {} };

const surveyDraftSlice = createSlice({
  name: 'surveyDraftReducer',
  initialState,
  reducers: {
    saveSurveyProgress: (
      state,
      action: PayloadAction<{
        surveyId: string;
        currentPageNo: number;
        surveyData: Record<string, any>;
      }>,
    ) => {
      const { surveyId, currentPageNo, surveyData } = action.payload;
      const previous = state.bySurveyId[surveyId]?.surveyData ?? {};
      state.bySurveyId[surveyId] = {
        currentPageNo,
        surveyData: { ...previous, ...surveyData },
      };
    },
    clearSurvey: (state, action: PayloadAction<{ surveyId: string }>) => {
      delete state.bySurveyId[action.payload.surveyId];
    },
  },
});

export const { saveSurveyProgress, clearSurvey } = surveyDraftSlice.actions;
export default surveyDraftSlice.reducer;

// Selectors
const surveyDraftStateSelector = (state: any): SurveyDraftState =>
  state.farmStateReducer[surveyDraftSlice.name] || initialState;

export const surveyDraftSelector = (surveyId: string) =>
  createSelector(
    [surveyDraftStateSelector],
    (draftState) => draftState.bySurveyId[surveyId] || emptyDraft,
  );

export const surveyInProgressSelector = (surveyId: string) =>
  createSelector(
    [surveyDraftStateSelector],
    (draftState) => Object.keys(draftState.bySurveyId[surveyId]?.surveyData ?? {}).length > 0,
  );
