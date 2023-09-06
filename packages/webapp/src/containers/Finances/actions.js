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
  ADD_CUSTOM_EXPENSE_TYPE,
  ADD_EXPENSES,
  ADD_OR_UPDATE_SALE,
  ADD_REMOVE_EXPENSE,
  DELETE_EXPENSES,
  DELETE_SALE,
  GET_FARM_EXPENSE_TYPE,
  GET_EXPENSE,
  GET_SALES,
  RETIRE_CUSTOM_EXPENSE_TYPE,
  SET_DATE_RANGE,
  SET_EXPENSE_TYPE,
  SET_EXPENSE,
  SET_EXPENSE_DETAIL_DATE,
  SET_EXPENSE_DETAIL_ITEM,
  SET_EXPENSES_TO_EDIT,
  SET_SALES_IN_STATE,
  SET_SELECTED_EDIT_EXPENSE,
  SET_SELECTED_EXPENSE_TYPE,
  SET_SELECTED_SALE,
  TEMP_DELETE_EXPENSE,
  TEMP_EDIT_EXPENSE,
  TEMP_SET_EXPENSE_TO_EDIT,
  UPDATE_SALE,
  UPDATE_CUSTOM_EXPENSE_TYPE,
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
export const addCustomExpenseType = (custom_expense_type) => {
  return {
    type: ADD_CUSTOM_EXPENSE_TYPE,
    custom_expense_type,
  };
};

export const retireCustomExpenseType = (expense_type_id) => {
  return {
    type: RETIRE_CUSTOM_EXPENSE_TYPE,
    expense_type_id,
  };
};

export const updateCustomExpenseType = (payload, expense_type_id) => {
  return {
    type: UPDATE_CUSTOM_EXPENSE_TYPE,
    custom_expense_type: payload,
    expense_type_id,
  };
};

export const setExpenseType = (expense_types) => {
  return {
    type: SET_EXPENSE_TYPE,
    expense_types,
  };
};

export const getFarmExpenseType = () => {
  return {
    type: GET_FARM_EXPENSE_TYPE,
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

export const setExpenseDetailItem = (expense) => {
  return {
    type: SET_EXPENSE_DETAIL_ITEM,
    expense,
  };
};

export const setSelectedExpenseTypes = (expense_types) => {
  return {
    type: SET_SELECTED_EXPENSE_TYPE,
    expense_types,
  };
};

export const deleteExpenses = (ids) => {
  return {
    type: DELETE_EXPENSES,
    ids,
  };
};

export const tempDeleteExpense = (expense_id) => {
  return {
    type: TEMP_DELETE_EXPENSE,
    expense_id,
  };
};

export const setEditExpenses = (expenses) => {
  return {
    type: SET_EXPENSES_TO_EDIT,
    expenses,
  };
};

export const tempSetEditExpense = (expense) => {
  return {
    type: TEMP_SET_EXPENSE_TO_EDIT,
    expense,
  };
};

export const tempEditExpense = (expense_id, data) => {
  return {
    type: TEMP_EDIT_EXPENSE,
    expense_id,
    data,
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
