/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (selectors.js) is part of LiteFarm.
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

import { createSelector } from 'reselect/es';

const shiftReducer = (state) => state.shiftReducer;

export const shiftsSelector = createSelector(shiftReducer, (state) => state.shifts);
export const shiftStartEndDateSelector = createSelector(shiftReducer, (state) => ({
  startDate: state.startDate,
  endDate: state.endDate,
}));

export const shiftTypeFilterSelector = createSelector(shiftReducer, ({ shiftType }) => shiftType);
