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

export interface CacheValidation {
  isComplete: boolean;
  controlled?: boolean;
}

interface OfflineReadinessState {
  wentOfflineDuringSetup: boolean;
  cacheValidation: CacheValidation | null;
}

const initialState: OfflineReadinessState = {
  wentOfflineDuringSetup: false,
  cacheValidation: null,
};

const offlineReadinessSlice = createSlice({
  name: 'offlineReadinessReducer',
  initialState,
  reducers: {
    setWentOfflineDuringSetup: (state, action: PayloadAction<boolean>) => {
      state.wentOfflineDuringSetup = action.payload;
    },
    setCacheValidation: (state, action: PayloadAction<CacheValidation>) => {
      state.cacheValidation = action.payload;
    },
  },
});

export const { setWentOfflineDuringSetup, setCacheValidation } = offlineReadinessSlice.actions;

export default offlineReadinessSlice.reducer;

export const offlineReadinessSelector = (state: any) =>
  state.tempStateReducer[offlineReadinessSlice.name];
