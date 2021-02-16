/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (reducer.js) is part of LiteFarm.
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
  SET_SALES_IN_STATE,
  SET_CROP_SALES_IN_STATE,
  SET_SELECTED_SALE,
  SET_SHIFT_FINANCE,
  SET_EXPENSE,
  SET_DEFAULT_EXPENSE_TYPE,
  SET_EXPENSE_DETAIL_DATE,
  SET_SELECTED_EXPENSE_TYPE,
  SET_EXPENSE_DETAIL_ITEM,
  SET_EXPENSES_TO_EDIT,
  SET_SELECTED_EDIT_EXPENSE,
  SET_DATE_RANGE,
  TEMP_SET_EXPENSE_TO_EDIT,
} from './constants';

import { combineForms } from 'react-redux-form';
import { combineReducers } from 'redux';

const initialState = {
  sales: null,
  cropSales: null,
  shifts: null,
};

function financeReducer(state = initialState, action) {
  switch (action.type) {
    case SET_SALES_IN_STATE:
      return Object.assign({}, state, {
        sales: action.sales,
      });
    case SET_CROP_SALES_IN_STATE:
      return Object.assign({}, state, {
        cropSales: action.cropSales,
      });
    case SET_SELECTED_SALE:
      return Object.assign({}, state, {
        selectedSale: action.sale,
      });
    case SET_SHIFT_FINANCE:
      return Object.assign({}, state, {
        shifts: action.shifts,
      });
    case SET_EXPENSE:
      return Object.assign({}, state, {
        expenses: action.expenses,
      });
    case SET_DEFAULT_EXPENSE_TYPE:
      return Object.assign({}, state, {
        expense_types: action.expense_types,
      });
    case SET_EXPENSE_DETAIL_DATE:
      return Object.assign({}, state, {
        expense_detail_date: action.expense_detail_date,
      });
    case SET_EXPENSE_DETAIL_ITEM:
      return Object.assign({}, state, {
        expense_to_detail: action.expense,
      });
    case SET_SELECTED_EXPENSE_TYPE:
      return Object.assign({}, state, {
        selected_expense_types: action.expense_types,
      });
    case SET_EXPENSES_TO_EDIT:
      return Object.assign({}, state, {
        expenses_to_edit: action.expenses,
      });
    case TEMP_SET_EXPENSE_TO_EDIT:
      return Object.assign({}, state, {
        expense_to_edit: action.expense,
      });
    case SET_SELECTED_EDIT_EXPENSE:
      return Object.assign({}, state, {
        selected_edit_expense: action.expense_types,
      });
    case SET_DATE_RANGE:
      return Object.assign({}, state, {
        date_range: action.rangeObj,
      });
    default:
      return state;
  }
}

export default combineReducers({
  forms: combineForms(
    {
      addSale: {},
      editSale: {},
      expenseDetail: {},
      date_range: null,
    },
    'financeReducer.forms',
  ),
  financeReducer,
});
