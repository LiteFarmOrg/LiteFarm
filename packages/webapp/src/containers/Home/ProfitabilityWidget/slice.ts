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
import type { Moment } from 'moment';
import { DateRangeOptions } from '../../../components/DateRangeSelector/types';
import DateRange from '../../../util/dateRange';

interface CustomRange {
  startDate?: string | Moment;
  endDate?: string | Moment;
}

export interface ProfitabilityDateRangeState {
  option: DateRangeOptions | string;
  startDate?: string | Moment;
  endDate?: string | Moment;
  customRange?: CustomRange;
}

interface ProfitabilityWidgetState {
  dateRange: ProfitabilityDateRangeState;
}

const initialYtd = new DateRange(new Date()).getDates(DateRangeOptions.YEAR_TO_DATE);

const initialState: ProfitabilityWidgetState = {
  dateRange: {
    option: DateRangeOptions.YEAR_TO_DATE,
    startDate: initialYtd.startDate,
    endDate: initialYtd.endDate,
  },
};

const profitabilityWidgetSlice = createSlice({
  name: 'profitabilityWidgetReducer',
  initialState,
  reducers: {
    updateDateRange(state, action: PayloadAction<Partial<ProfitabilityDateRangeState>>) {
      state.dateRange = { ...state.dateRange, ...action.payload };
    },
  },
});

export const { updateDateRange } = profitabilityWidgetSlice.actions;
export default profitabilityWidgetSlice.reducer;

const sliceState = (state: any): ProfitabilityWidgetState | undefined =>
  state?.tempStateReducer?.[profitabilityWidgetSlice.name];

export const profitabilityDateRangeSelector = (state: any): ProfitabilityDateRangeState =>
  sliceState(state)?.dateRange ?? initialState.dateRange;

export const profitabilityDateRangeDataSelector = (state: any) => {
  const dr = profitabilityDateRangeSelector(state);
  return {
    option: dr.option,
    startDate: dr.startDate,
    endDate: dr.endDate,
    customRange: dr.customRange,
  };
};
