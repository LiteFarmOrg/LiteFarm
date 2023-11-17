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
  SET_CROP_SALES_IN_STATE,
  SET_DATE_RANGE,
  SET_EXPENSE,
  SET_EXPENSE_DETAIL_DATE,
  SET_EXPENSE_TYPE,
  SET_IS_FETCHING_DATA,
  SET_SALES_IN_STATE,
  SET_SELECTED_EXPENSE_TYPE,
  SET_SELECTED_SALE,
} from './constants';

import { combineForms } from 'react-redux-form';
import { combineReducers } from 'redux';
import { dateRangeOptions } from '../../components/DateRangeSelector/constants';

const initialState = {
  sales: null,
  cropSales: null,
  date_range: { option: dateRangeOptions.YEAR_TO_DATE },
  isFetchingData: true,
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
    case SET_EXPENSE:
      return Object.assign({}, state, {
        expenses: action.expenses,
      });
    case SET_EXPENSE_TYPE:
      return Object.assign({}, state, {
        expense_types: action.expense_types,
      });
    case SET_EXPENSE_DETAIL_DATE:
      return Object.assign({}, state, {
        expense_detail_date: action.expense_detail_date,
      });
    case SET_SELECTED_EXPENSE_TYPE:
      return Object.assign({}, state, {
        selected_expense_types: action.expense_types,
      });
    case SET_DATE_RANGE:
      return Object.assign({}, state, {
        date_range: { ...state.date_range, ...action.rangeObj },
      });
    case SET_IS_FETCHING_DATA:
      return Object.assign({}, state, {
        isFetchingData: action.isFetching,
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
