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

export interface SurveyDraft {
  currentPageNo: number;
  surveyData: Record<string, any>;
  surveyVersion?: string;
  submissionId?: string;
  updatedAt?: number;
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
        surveyVersion?: string;
        // Defaults to now; callers adopting server content should pass the server's own
        // updated_at, not when it was merely copied into this store.
        updatedAt?: number;
      }>,
    ) => {
      const {
        surveyId,
        currentPageNo,
        surveyData,
        surveyVersion,
        updatedAt = Date.now(),
      } = action.payload;
      state.bySurveyId[surveyId] = {
        ...state.bySurveyId[surveyId],
        currentPageNo,
        surveyData,
        surveyVersion,
        updatedAt,
      };
    },
    setDraftSubmissionId: (
      state,
      action: PayloadAction<{ surveyId: string; submissionId: string }>,
    ) => {
      const { surveyId, submissionId } = action.payload;
      state.bySurveyId[surveyId] = {
        ...(state.bySurveyId[surveyId] || emptyDraft),
        submissionId,
      };
    },
    clearSurvey: (state, action: PayloadAction<{ surveyId: string }>) => {
      delete state.bySurveyId[action.payload.surveyId];
    },
  },
});

export const { saveSurveyProgress, setDraftSubmissionId, clearSurvey } = surveyDraftSlice.actions;
export default surveyDraftSlice.reducer;

// Selectors
const surveyDraftStateSelector = (state: any): SurveyDraftState =>
  state.farmStateReducer[surveyDraftSlice.name] || initialState;

export const allSurveyDraftsSelector = createSelector(
  [surveyDraftStateSelector],
  (draftState) => draftState.bySurveyId,
);

export const surveyDraftSelector = (surveyId: string) =>
  createSelector(
    [surveyDraftStateSelector],
    (draftState) => draftState.bySurveyId[surveyId] || emptyDraft,
  );
