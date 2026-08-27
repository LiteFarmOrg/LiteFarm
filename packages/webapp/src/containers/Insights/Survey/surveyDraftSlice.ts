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
  surveyVersion?: string;
  submissionId?: string;
  updatedAt?: number;
}

interface SurveyDraftState {
  // e.g., { tape: { STEP1: {...}, STEP2: {...} }, cathi_gao: { '': {...} } }
  bySurveyId: Record<string, Record<string, SurveyDraft>>;
}

const initialState: SurveyDraftState = {
  bySurveyId: {},
};

const emptyDraft: SurveyDraft = { currentPageNo: 0, surveyData: {} };

const normalizeStep = (surveyStep?: string) => surveyStep ?? '';

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
        surveyStep?: string;
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
        surveyStep,
        updatedAt = Date.now(),
      } = action.payload;
      const step = normalizeStep(surveyStep);
      const previous = state.bySurveyId[surveyId]?.[step] ?? emptyDraft;
      state.bySurveyId[surveyId] = {
        ...state.bySurveyId[surveyId],
        [step]: {
          ...previous,
          currentPageNo,
          surveyData,
          surveyVersion,
          updatedAt,
        },
      };
    },
    setDraftSubmissionId: (
      state,
      action: PayloadAction<{ surveyId: string; surveyStep?: string; submissionId: string }>,
    ) => {
      const { surveyId, surveyStep, submissionId } = action.payload;
      const step = normalizeStep(surveyStep);
      state.bySurveyId[surveyId] = {
        ...state.bySurveyId[surveyId],
        [step]: {
          ...(state.bySurveyId[surveyId]?.[step] ?? emptyDraft),
          submissionId,
        },
      };
    },
    clearSurvey: (state, action: PayloadAction<{ surveyId: string; surveyStep?: string }>) => {
      const { surveyId, surveyStep } = action.payload;
      const surveyDrafts = state.bySurveyId[surveyId];
      if (!surveyDrafts) {
        return;
      }
      delete surveyDrafts[normalizeStep(surveyStep)];
      if (Object.keys(surveyDrafts).length === 0) {
        delete state.bySurveyId[surveyId];
      }
    },
  },
});

export const { saveSurveyProgress, setDraftSubmissionId, clearSurvey } = surveyDraftSlice.actions;
export default surveyDraftSlice.reducer;

// Selectors
const surveyDraftStateSelector = (state: any): SurveyDraftState =>
  state.farmStateReducer[surveyDraftSlice.name] || initialState;

export const surveyDraftSelector = (surveyId: string, surveyStep?: string) =>
  createSelector(
    [surveyDraftStateSelector],
    (draftState) => draftState.bySurveyId[surveyId]?.[normalizeStep(surveyStep)] || emptyDraft,
  );
