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
  ADD_EXPENSES,
  ADD_REMOVE_EXPENSE,
  ADD_SALE,
  DELETE_EXPENSE,
  DELETE_EXPENSES,
  DELETE_SALE,
  GET_EXPENSE,
  GET_FARM_EXPENSE_TYPE,
  GET_SALES,
  SET_DATE_RANGE,
  SET_EXPENSE,
  SET_EXPENSE_DETAIL_DATE,
  SET_EXPENSE_TYPE,
  SET_IS_FETCHING_DATA,
  SET_SALES_IN_STATE,
  SET_SELECTED_EXPENSE_TYPE,
  SET_SELECTED_SALE,
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

export const addSale = (sale) => {
  return {
    type: ADD_SALE,
    sale,
  };
};

export const updateSale = (sale) => {
  return {
    type: UPDATE_SALE,
    sale,
  };
};

export const deleteSale = (sale_id) => {
  return {
    type: DELETE_SALE,
    sale_id,
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

export const deleteExpense = (expense_id) => {
  return {
    type: DELETE_EXPENSE,
    expense_id,
  };
};

export const addRemoveExpense = (addRemoveObj) => {
  return {
    type: ADD_REMOVE_EXPENSE,
    addRemoveObj,
  };
};

//range obj = {startDate: ..., endDate..., option: ..., customRange: {startDate: ..., endDate: ...}}
export const setDateRange = (rangeObj) => {
  return {
    type: SET_DATE_RANGE,
    rangeObj,
  };
};

export const setIsFetchingData = (isFetching) => {
  return {
    type: SET_IS_FETCHING_DATA,
    isFetching,
  };
};
