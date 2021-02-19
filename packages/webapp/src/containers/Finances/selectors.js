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

const financeSelector = (state) => state.financeReducer.financeReducer || {};

const salesSelector = createSelector(financeSelector, (state) => state.sales);

const selectedSaleSelector = createSelector(financeSelector, (state) => state.selectedSale);

const shiftSelector = createSelector(financeSelector, (state) => state.shifts);

const expenseSelector = createSelector(financeSelector, (state) => state.expenses);

const expenseTypeSelector = createSelector(financeSelector, (state) => state.expense_types);

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
  shiftSelector,
  expenseSelector,
  expenseTypeSelector,
  expenseDetailDateSelector,
  selectedExpenseSelector,
  expenseDetailSelector,
  expensesToEditSelector,
  selectedEditExpenseSelector,
  dateRangeSelector,
  expenseToDetailSelector,
  tempExpenseToEditSelector,
};
