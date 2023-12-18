/*
 *  Copyright 2023 LiteFarm.org
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
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { revenueTypesSelector } from '../revenueTypeSlice';
import { getRevenueTypes } from './saga';

export default function useSortedCustomRevenueTypes() {
  const [customRevenueTypeTileContents, setCustomRevenueTypeTileContents] = useState([]);

  const dispatch = useDispatch();
  const revenueTypes = useSelector(revenueTypesSelector);

  useEffect(() => {
    if (!revenueTypes) {
      dispatch(getRevenueTypes());
      return;
    }

    const contents = revenueTypes
      .filter((type) => !!type.farm_id)
      .sort((typeA, typeB) =>
        typeA.revenue_translation_key.localeCompare(typeB.revenue_translation_key),
      );
    setCustomRevenueTypeTileContents(contents);
  }, [revenueTypes]);

  return customRevenueTypeTileContents;
}
