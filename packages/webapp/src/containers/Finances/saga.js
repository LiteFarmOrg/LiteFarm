/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (saga.js) is part of LiteFarm.
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
  ADD_OR_UPDATE_SALE,
  ADD_REMOVE_EXPENSE,
  DELETE_EXPENSES,
  DELETE_SALE,
  GET_DEFAULT_EXPENSE_TYPE,
  GET_EXPENSE,
  GET_SALES,
  GET_SHIFT_FINANCE,
  UPDATE_SALE,
} from './constants';
import { setDefaultExpenseType, setExpense, setSalesInState, setShifts } from './actions';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import apiConfig from './../../apiConfig';
import { toastr } from 'react-redux-toastr';
import { loginSelector } from '../userFarmSlice';
import { getHeader, handleError } from '../saga';
import i18n from '../../lang/i18n';

const axios = require('axios');

export function* getSales() {
  const { salesURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, salesURL + '/' + farm_id, header);
    if (result) {
      yield put(setSalesInState(result.data));
    }
  } catch (e) {
    yield put(handleError(e));
    console.log('failed to fetch fields from database');
  }
}

export function* addSale(action) {
  const { salesURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  const addOrUpdateSuccess = action.sale.sale_id ? 'updated' : 'added';
  const addOrUpdateFail = action.sale.sale_id ? 'update' : 'add';
  try {
    const result = yield call(axios.post, salesURL, action.sale, header);
    if (result) {
      toastr.success(`Successfully ${addOrUpdateSuccess} new Sale!`);
      const result = yield call(axios.get, salesURL + '/' + farm_id, header);
      if (result) {
        yield put(setSalesInState(result.data));
      }
    }
  } catch (e) {
    yield put(handleError(e));
    console.log(`failed to ${addOrUpdateFail} sale`);
    toastr.error(`Failed to ${addOrUpdateFail} new Sale`);
  }
}

export function* updateSaleSaga(action) {
  const { salesURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.patch, salesURL, action.sale, header);
    if (result) {
      toastr.success(i18n.t('message:SALE.SUCCESS.UPDATE'));
      const result = yield call(axios.get, salesURL + '/' + farm_id, header);
      if (result) {
        yield put(setSalesInState(result.data));
      }
    }
  } catch (e) {
    yield put(handleError(e));
    console.log(`failed to update sale`);
    toastr.error(i18n.t('message:SALE.ERROR.UPDATE'));
  }
}

export function* deleteSale(action) {
  const { salesURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.delete, salesURL + '/' + action.sale.id, header);
    if (result) {
      const result = yield call(axios.get, salesURL + '/' + farm_id, header);
      if (result) {
        yield put(setSalesInState(result.data));
      }
      toastr.success(i18n.t('message:SALE.SUCCESS.DELETE'));
    }
  } catch (e) {
    yield put(handleError(e));
    console.log(`failed to delete sale`);
    toastr.error(i18n.t('message:SALE.ERROR.DELETE'));
  }
}

export function* getShiftsSaga() {
  const { farmShiftUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, farmShiftUrl + farm_id, header);
    if (result) {
      yield put(setShifts(result.data));
    }
  } catch (e) {
    yield put(handleError(e));
    console.log('failed to fetch shifts from database');
  }
}

export function* getExpenseSaga() {
  const { expenseUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, expenseUrl + '/farm/' + farm_id, header);
    if (result) {
      yield put(setExpense(result.data));
    }
  } catch (e) {
    yield put(handleError(e));
    if (e.response.status === 404) {
      yield put(setExpense([]));
    }
    console.log('failed to fetch expenses from database');
  }
}

export function* getDefaultExpenseTypeSaga() {
  const { expenseTypeDefaultUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, expenseTypeDefaultUrl, header);
    if (result) {
      yield put(setDefaultExpenseType(result.data));
    }
  } catch (e) {
    yield put(handleError(e));
    console.log('failed to fetch expenses from database');
  }
}

export function* addExpensesSaga(action) {
  const { expenseUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.post, expenseUrl + '/farm/' + farm_id, action.expenses, header);
    if (result) {
      toastr.success(i18n.t('message:EXPENSE.SUCCESS.ADD'));
      const result = yield call(axios.get, expenseUrl + '/farm/' + farm_id, header);
      if (result) {
        yield put(setExpense(result.data));
      }
    }
  } catch (e) {
    yield put(handleError(e));
    toastr.error(i18n.t('message:EXPENSE.ERROR.ADD'));
  }
}

export function* deleteExpensesSaga(action) {
  const { expenseUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.put, expenseUrl, action.ids, header);
    if (result) {
      toastr.success(i18n.t('message:EXPENSE.SUCCESS.DELETE'));
      const result = yield call(axios.get, expenseUrl + '/farm/' + farm_id, header);
      if (result) {
        yield put(setExpense(result.data));
      }
    }
  } catch (e) {
    yield put(handleError(e));
    toastr.success();
    toastr.error(i18n.t('message:EXPENSE.ERROR.DELETE'));
  }
}

export function* addRemoveExpenseSaga(action) {
  console.log('add remove expenses saga');
  const { expenseUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    let addRemoveObj = action.addRemoveObj;
    let result = yield call(axios.put, expenseUrl, addRemoveObj.remove, header);
    if (result) {
      result = yield call(axios.post, expenseUrl, addRemoveObj.add, header);
      if (result) {
        toastr.success(i18n.t('message:EXPENSE.SUCCESS.UPDATE'));
        const result = yield call(axios.get, expenseUrl + '/farm/' + farm_id, header);
        if (result) {
          yield put(setExpense(result.data));
        }
      }
    }
  } catch (e) {
    yield put(handleError(e));
    toastr.error(i18n.t('message:EXPENSE.ERROR.UPDATE'));
  }
}

export default function* financeSaga() {
  yield takeEvery(GET_SALES, getSales);
  yield takeEvery(ADD_OR_UPDATE_SALE, addSale);
  yield takeEvery(GET_SHIFT_FINANCE, getShiftsSaga);
  yield takeEvery(GET_EXPENSE, getExpenseSaga);
  yield takeEvery(GET_DEFAULT_EXPENSE_TYPE, getDefaultExpenseTypeSaga);
  yield takeEvery(ADD_EXPENSES, addExpensesSaga);
  yield takeEvery(DELETE_SALE, deleteSale);
  yield takeEvery(DELETE_EXPENSES, deleteExpensesSaga);
  yield takeEvery(ADD_REMOVE_EXPENSE, addRemoveExpenseSaga);
  yield takeEvery(UPDATE_SALE, updateSaleSaga);
}
