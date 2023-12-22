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

// Include retired (but not deleted) types
const allExpenseTypeSelector = createSelector(financeSelector, (state) => {
  return state.expense_types?.filter((type) => !type.deleted) ?? [];
});

// Active types
const expenseTypeSelector = createSelector(financeSelector, (state) => {
  return state.expense_types?.filter((type) => !type.deleted && !type.retired);
});

const revenueByIdSelector = (sale_id) => {
  return createSelector(financeSelector, (state) => {
    return state.sales.find((sale) => sale.sale_id == sale_id);
  });
};

const expenseByIdSelector = (expense_id) => {
  return createSelector(financeSelector, (state) => {
    return state.expenses.find((expense) => expense.farm_expense_id == expense_id);
  });
};

const expenseTypeByIdSelector = (expense_type_id) => {
  return createSelector(financeSelector, (state) => {
    return state.expense_types.find((type) => type.expense_type_id == expense_type_id);
  });
};

export const sortExpenseTypes = (expenseTypes) => {
  const allTypes = expenseTypes ?? [];

  return [...allTypes].sort((typeA, typeB) => {
    const compareKeyA =
      typeA.farm_id === null
        ? i18n.t(`expense:${typeA.expense_translation_key}.EXPENSE_NAME`)
        : typeA.expense_translation_key;

    const compareKeyB =
      typeB.farm_id === null
        ? i18n.t(`expense:${typeB.expense_translation_key}.EXPENSE_NAME`)
        : typeB.expense_translation_key;

    return compareKeyA.localeCompare(compareKeyB);
  });
};

const allExpenseTypeTileContentsSelector = createSelector(financeSelector, (state) => {
  return sortExpenseTypes(state.expense_types);
});

const expenseTypeTileContentsSelector = createSelector(financeSelector, (state) => {
  return sortExpenseTypes(state.expense_types).filter((type) => !type.deleted && !type.retired);
});

const expenseDetailDateSelector = createSelector(
  financeSelector,
  (state) => state.expense_detail_date,
);

const selectedExpenseSelector = createSelector(
  financeSelector,
  (state) => state.selected_expense_types,
);

const dateRangeDataSelector = createSelector(financeSelector, (state) => state.date_range);

const isFetchingDataSelector = createSelector(financeSelector, (state) => state.isFetchingData);

export {
  allExpenseTypeSelector,
  allExpenseTypeTileContentsSelector,
  dateRangeDataSelector,
  expenseByIdSelector,
  expenseDetailDateSelector,
  expenseSelector,
  expenseTypeByIdSelector,
  expenseTypeSelector,
  expenseTypeTileContentsSelector,
  isFetchingDataSelector,
  revenueByIdSelector,
  salesSelector,
  selectedExpenseSelector,
  selectedSaleSelector,
};
