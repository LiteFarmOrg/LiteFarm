/*
 *  Copyright 2024 LiteFarm.org
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

// In tempStateReducer > filterReducer
export interface ReduxFilterEntity {
  [filterKey: /* e.g. STATUS, LOCATION */ string]: FilterState;
}

export interface FilterState {
  [optionValue: string]: /* e.g. ABANDONED, COMPLETED */ {
    active: boolean;
    label: string /* e.g. 'Abandoned', 'Completed */;
  };
}

export type FilterOnChangeCallback =
  | ((filterKey: string, filterState: FilterState) => void) // Finance Report
  | (() => void); // !isDirty && setIsDirty(true) from FilterPage and TransactionFilter
