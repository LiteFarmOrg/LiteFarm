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
import type { RootState } from '../store/store';
import { CONSENT_VERSION } from '../util/constants';

export interface UserConsent {
  consent_version: string;
  consented_at: string | null;
}

interface ConsentState {
  consent: UserConsent | null;
}

const initialState: ConsentState = {
  consent: null,
};

const replaceConsent = (
  state: ConsentState,
  { payload }: PayloadAction<UserConsent | null | undefined>,
) => {
  state.consent = payload ?? null;
};

const consentSlice = createSlice({
  name: 'consentReducer',
  initialState,
  reducers: {
    fetchConsentSuccess: replaceConsent,
    patchConsentSuccess: replaceConsent,
  },
});

export const { fetchConsentSuccess, patchConsentSuccess } = consentSlice.actions;
export default consentSlice.reducer;

export const consentSelector = (state: RootState) => state.entitiesReducer.consentReducer.consent;

export const hasConsentedSelector = (state: RootState) =>
  consentSelector(state)?.consent_version === CONSENT_VERSION;
