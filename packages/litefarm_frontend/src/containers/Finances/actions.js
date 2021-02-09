/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (actions.js) is part of LiteFarm.
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

import {
  GET_SALES,
  SET_SALES_IN_STATE,
  ADD_OR_UPDATE_SALE,
  SET_SELECTED_SALE,
  DELETE_SALE,
  SET_SHIFT_FINANCE,
  GET_SHIFT_FINANCE,
  GET_EXPENSE,
  SET_EXPENSE,
  SET_DEFAULT_EXPENSE_TYPE,
  GET_DEFAULT_EXPENSE_TYPE,
  SET_EXPENSE_DETAIL_DATE,
  SET_SELECTED_EXPENSE,
  ADD_EXPENSES,
  DELETE_EXPENSES,
  SET_EXPENSES_TO_EDIT,
  SET_SELECTED_EDIT_EXPENSE,
  ADD_REMOVE_EXPENSE,
  SET_DATE_RANGE,
  UPDATE_SALE,
} from './constants';

export const getSales = () => {
  return {
    type: GET_SALES,
  };
};

export const setSalesInState = (sales) => {
  return {
    type: SET_SALES_IN_STATE,
    sales,
  };
};

export const addOrUpdateSale = (sale) => {
  return {
    type: ADD_OR_UPDATE_SALE,
    sale,
  };
};

export const updateSale = (sale) => {
  return {
    type: UPDATE_SALE,
    sale,
  };
};

export const deleteSale = (sale) => {
  return {
    type: DELETE_SALE,
    sale,
  };
};

export const setSelectedSale = (sale) => {
  return {
    type: SET_SELECTED_SALE,
    sale,
  };
};

export const getShifts = () => {
  return {
    type: GET_SHIFT_FINANCE,
  };
};

export const setShifts = (shifts) => {
  return {
    type: SET_SHIFT_FINANCE,
    shifts,
  };
};

export const getExpense = () => {
  return {
    type: GET_EXPENSE,
  };
};

export const setExpense = (expenses) => {
  return {
    type: SET_EXPENSE,
    expenses,
  };
};

export const getDefaultExpenseType = () => {
  return {
    type: GET_DEFAULT_EXPENSE_TYPE,
  };
};

export const setDefaultExpenseType = (expense_types) => {
  return {
    type: SET_DEFAULT_EXPENSE_TYPE,
    expense_types,
  };
};

export const addExpenses = (expenses) => {
  return {
    type: ADD_EXPENSES,
    expenses,
  };
};

export const setExpenseDetailDate = (expense_detail_date) => {
  return {
    type: SET_EXPENSE_DETAIL_DATE,
    expense_detail_date,
  };
};

export const setSelectedExpense = (expense_types) => {
  return {
    type: SET_SELECTED_EXPENSE,
    expense_types,
  };
};

export const deleteExpenses = (ids) => {
  return {
    type: DELETE_EXPENSES,
    ids,
  };
};

export const setEditExpenses = (expenses) => {
  return {
    type: SET_EXPENSES_TO_EDIT,
    expenses,
  };
};

export const setSelectedEditExpense = (expense_types) => {
  return {
    type: SET_SELECTED_EDIT_EXPENSE,
    expense_types,
  };
};

export const addRemoveExpense = (addRemoveObj) => {
  return {
    type: ADD_REMOVE_EXPENSE,
    addRemoveObj,
  };
};

//range obj = {startDate: ..., endDate...}
export const setDateRange = (rangeObj) => {
  return {
    type: SET_DATE_RANGE,
    rangeObj,
  };
};
