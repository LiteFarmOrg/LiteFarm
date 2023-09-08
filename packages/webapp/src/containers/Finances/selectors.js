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
import i18n from '../../locales/i18n';

const financeSelector = (state) => state.financeReducer.financeReducer || {};

const salesSelector = createSelector(financeSelector, (state) => state.sales);

const selectedSaleSelector = createSelector(financeSelector, (state) => state.selectedSale);

const expenseSelector = createSelector(financeSelector, (state) => state.expenses);

const allExpenseTypeSelector = createSelector(financeSelector, (state) => state.expense_types);

const expenseTypeSelector = createSelector(financeSelector, (state) => {
  return state.expense_types?.filter((type) => !type.deleted);
});

const expenseTypeByIdSelector = (expense_type_id) => {
  return createSelector(financeSelector, (state) => {
    return state.expense_types.find((type) => type.expense_type_id == expense_type_id);
  });
};

const expenseTypeTileContentsSelector = createSelector(financeSelector, (state) => {
  const defaultTypes = [];
  const customTypes = [];
  state.expense_types?.forEach((type) => {
    if (!type.deleted) {
      const arrayToUpdate = type.farm_id ? customTypes : defaultTypes;
      arrayToUpdate.push(type);
    }
  });

  return [
    ...defaultTypes.sort((typeA, typeB) =>
      i18n
        .t(`expense:${typeA.expense_translation_key}`)
        .localeCompare(i18n.t(`expense:${typeB.expense_translation_key}`)),
    ),
    ...customTypes.sort((typeA, typeB) =>
      typeA.expense_translation_key.localeCompare(typeB.expense_translation_key),
    ),
  ];
});

const expenseDetailDateSelector = createSelector(
  financeSelector,
  (state) => state.expense_detail_date,
);

const selectedExpenseSelector = createSelector(
  financeSelector,
  (state) => state.selected_expense_types,
);

const expenseToDetailSelector = createSelector(financeSelector, (state) => state.expense_to_detail);

const financeFormSelector = (state) => state.financeReducer.forms || {};

const expenseDetailSelector = createSelector(financeFormSelector, (state) => state.expenseDetail);

const expensesToEditSelector = createSelector(financeSelector, (state) => state.expenses_to_edit);

const tempExpenseToEditSelector = createSelector(financeSelector, (state) => state.expense_to_edit);

const selectedEditExpenseSelector = createSelector(
  financeSelector,
  (state) => state.selected_edit_expense,
);

const dateRangeSelector = createSelector(financeSelector, (state) => state.date_range);

export {
  salesSelector,
  selectedSaleSelector,
  expenseSelector,
  expenseTypeSelector,
  allExpenseTypeSelector,
  expenseTypeByIdSelector,
  expenseTypeTileContentsSelector,
  expenseDetailDateSelector,
  selectedExpenseSelector,
  expenseDetailSelector,
  expensesToEditSelector,
  selectedEditExpenseSelector,
  dateRangeSelector,
  expenseToDetailSelector,
  tempExpenseToEditSelector,
};
