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

import type { FilterState } from './types';

/**
 * Checks if all the filters in the filterObject are inactive. Will return true if all filters are set to false, or filter is an empty object (= initial state)
 *
 * @param filterObject - The filter state object
 * @returns A boolean indicating whether all the filters are inactive.
 */
export const isInactive = (filterObject: FilterState): boolean => {
  return Object.keys(filterObject).every((key) => !filterObject[key].active);
};
