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
 *  GNU General Public License for more details, see <https://wwwl.gnu.org/licenses/>.
 */

enum FilterType {
  FILTER_PILL = 'FILTER_PILL', // default or not provided is FILTER_PILL
  SEARCHABLE_MULTI_SELECT = 'SEARCHABLE_MULTI_SELECT',
  DATE = 'DATE',
  DATE_RANGE = 'DATE_RANGE',
}

// After permutation of Redux entity shape; how filters are passed and used in components
export interface ComponentFilter {
  subject: string; // Translated filter label, e.g. Expense Type
  filterKey: string; // identifier e.g. EXPENSE_TYPE
  type?: FilterType;
  options: ComponentFilterOption[];
}

export interface ComponentFilterOption {
  value: string | number; // unique identifier
  label: string;
  default: boolean;
}
