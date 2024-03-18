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

import { useDispatch, useSelector } from 'react-redux';
import produce from 'immer';
import { AnimalsFilterKeys } from '../../../Filter/Animals/types';
import { animalsFilterSelector, setAnimalsFilter } from '../../../filterSlice';
import { getActiveTypeIds } from '../../../Filter/Animals/utils';

export const useAnimalsFilterReduxState = () => {
  const dispatch = useDispatch();
  const animalsFilter = useSelector(animalsFilterSelector);

  const selectedTypeIds = getActiveTypeIds(animalsFilter);

  const updateSelectedTypeIds = (typeIds: string[]) => {
    let newFilterState = produce(
      animalsFilter[AnimalsFilterKeys.TYPE],
      (filterState: { [key: string]: { label?: string; active: boolean } }) => {
        for (const key in filterState) {
          filterState[key].active = false;
        }

        for (const key of typeIds) {
          if (!filterState[key]) {
            filterState[key] = { active: true };
          } else {
            filterState[key].active = true;
          }
        }
      },
    );

    dispatch(setAnimalsFilter({ ...animalsFilter, [AnimalsFilterKeys.TYPE]: newFilterState }));
  };

  return { selectedTypeIds, updateSelectedTypeIds };
};
