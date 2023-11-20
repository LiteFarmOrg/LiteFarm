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
import { expenseTypeSelector } from './selectors';
import { getFarmExpenseType } from './actions';

export default function useCustomExpenseTypeTileContents() {
  const [customExpenseTypeTileContents, setCustomExpenseTypeTileContents] = useState([]);

  const dispatch = useDispatch();
  const expenseTypes = useSelector(expenseTypeSelector);

  useEffect(() => {
    if (!expenseTypes) {
      dispatch(getFarmExpenseType());
      return;
    }

    const contents = expenseTypes
      .filter((type) => !type.deleted && type.farm_id)
      .sort((typeA, typeB) =>
        typeA.expense_translation_key.localeCompare(typeB.expense_translation_key),
      );
    setCustomExpenseTypeTileContents(contents);
  }, [expenseTypes]);

  return customExpenseTypeTileContents;
}
