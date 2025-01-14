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
import { AnimalsFilterKeys } from '../../../Filter/Animals/types';
import { animalsFilterSelector, setAnimalsFilter } from '../../../filterSlice';
import { getActiveTypeIds } from '../../../Filter/Animals/utils';

export const useAnimalsFilterReduxState = () => {
  const dispatch = useDispatch();
  const animalsFilter = useSelector(animalsFilterSelector);

  const selectedTypeIds = getActiveTypeIds(animalsFilter[AnimalsFilterKeys.TYPE]);

  const updateSelectedTypeIds = (typeId: string) => {
    const isSelected = selectedTypeIds.includes(typeId);
    const newFilterState = {
      ...animalsFilter[AnimalsFilterKeys.TYPE],
      [typeId]: { active: !isSelected },
    };
    dispatch(setAnimalsFilter({ ...animalsFilter, [AnimalsFilterKeys.TYPE]: newFilterState }));
  };

  return { selectedTypeIds, updateSelectedTypeIds };
};
