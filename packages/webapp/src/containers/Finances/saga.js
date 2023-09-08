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
  GET_FARM_EXPENSE_TYPE,
  GET_EXPENSE,
  GET_SALES,
  TEMP_DELETE_EXPENSE,
  TEMP_EDIT_EXPENSE,
  UPDATE_SALE,
} from './constants';
import { setExpenseType, setExpense, setSalesInState } from './actions';
import { call, put, select, takeLatest, takeLeading, race, take } from 'redux-saga/effects';
import apiConfig from './../../apiConfig';
import { loginSelector } from '../userFarmSlice';
import { axios, getHeader, getManagementPlanAndPlantingMethodSuccessSaga } from '../saga';
import i18n from '../../locales/i18n';
import history from '../../history';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../Snackbar/snackbarSlice';
import { createAction } from '@reduxjs/toolkit';
import {
  getRevenueTypesSuccess,
  deleteRevenueTypeSuccess,
  postRevenueTypeSuccess,
  putRevenueTypeSuccess,
} from '../revenueTypeSlice';

export function* getSales() {
  const { salesURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, salesURL + '/' + farm_id, header);
    if (result) {
      // TODO: change this after sale slice reducer is remade
      yield put(setSalesInState(result.data));
    }
  } catch (e) {
    console.log('failed to fetch fields from database');
  }
}

export function* addSale(action) {
  const { salesURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  const addOrUpdateSuccess = action.sale.sale_id
    ? i18n.t('message:SALE.SUCCESS.UPDATE')
    : i18n.t('message:SALE.SUCCESS.ADD');
  const addOrUpdateFail = action.sale.sale_id
    ? i18n.t('message:SALE.ERROR.UPDATE')
    : i18n.t('message:SALE.ERROR.ADD');
  try {
    const result = yield call(axios.post, salesURL, action.sale, header);
    yield put(enqueueSuccessSnackbar(addOrUpdateSuccess));
    yield call(getSales);
    history.push('/finances');
  } catch (e) {
    yield put(enqueueErrorSnackbar(addOrUpdateFail));
  }
}

export function* updateSaleSaga(action) {
  const { salesURL } = apiConfig;
  let { sale } = action;
  let { sale_id } = sale;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  delete sale.sale_id;

  try {
    const result = yield call(axios.patch, `${salesURL}/${sale_id}`, sale, header);
    yield put(enqueueSuccessSnackbar(i18n.t('message:SALE.SUCCESS.UPDATE')));
    yield call(getSales);
    history.push('/finances');
  } catch (e) {
    console.log(`failed to update sale`);
    yield put(enqueueErrorSnackbar(i18n.t('message:SALE.ERROR.UPDATE')));
  }
}

export function* deleteSale(action) {
  const { salesURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.delete, salesURL + '/' + action.sale.sale_id, header);
    yield put(enqueueSuccessSnackbar(i18n.t('message:SALE.SUCCESS.DELETE')));
    yield call(getSales);
    history.push('/finances');
  } catch (e) {
    console.log(`failed to delete sale`);
    yield put(enqueueErrorSnackbar(i18n.t('message:SALE.ERROR.DELETE')));
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
    if (e.response.status === 404) {
      yield put(setExpense([]));
    }
    console.log('failed to fetch expenses from database');
  }
}

export function* getFarmExpenseTypeSaga() {
  const { expenseTypeUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, `${expenseTypeUrl}/farm/${farm_id}`, header);
    if (result) {
      yield put(setExpenseType(result.data));
    }
  } catch (e) {
    console.log('failed to fetch expenses from database');
  }
}

export const addCustomExpenseType = createAction('addCustomExpenseTypeSaga');

export function* addCustomExpenseTypeSaga({ payload: { expense_name } }) {
  const { expenseTypeUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.post, expenseTypeUrl, { farm_id, expense_name }, header);
    if (result) {
      yield put(enqueueSuccessSnackbar(i18n.t('message:EXPENSE_TYPE.SUCCESS.ADD')));
      yield call(getFarmExpenseTypeSaga);
      history.push('/manage_custom_expenses');
    }
  } catch (e) {
    console.log('failed to add new expense type to the database');
    yield put(enqueueErrorSnackbar(i18n.t('message:EXPENSE_TYPE.ERROR.ADD')));
  }
}

export const updateCustomExpenseType = createAction('updateCustomExpenseTypeSaga');

export function* updateCustomExpenseTypeSaga({ payload: { expense_name, expense_type_id } }) {
  const { expenseTypeUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(
      axios.patch,
      `${expenseTypeUrl}/${expense_type_id}`,
      { farm_id, expense_name },
      header,
    );
    if (result) {
      yield put(enqueueSuccessSnackbar(i18n.t('message:EXPENSE_TYPE.SUCCESS.UPDATE')));
      yield call(getFarmExpenseTypeSaga);
      history.push('/manage_custom_expenses');
    }
  } catch (e) {
    console.log('failed to update expense type in the database');
    yield put(enqueueErrorSnackbar(i18n.t('message:EXPENSE_TYPE.ERROR.UPDATE')));
  }
}

export const retireCustomExpenseType = createAction('retireCustomExpenseTypeSaga');

export function* retireCustomExpenseTypeSaga({ payload: { expense_type_id } }) {
  const { expenseTypeUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.delete, `${expenseTypeUrl}/${expense_type_id}`, header);
    if (result) {
      yield put(enqueueSuccessSnackbar(i18n.t('message:EXPENSE_TYPE.SUCCESS.DELETE')));
      yield call(getFarmExpenseTypeSaga);
      history.push('/manage_custom_expenses');
    }
  } catch (e) {
    console.log('failed to delete new expense type in the database');
    yield put(enqueueErrorSnackbar(i18n.t('message:EXPENSE_TYPE.ERROR.DELETE')));
  }
}

export function* addExpensesSaga(action) {
  const { expenseUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.post, expenseUrl + '/farm/' + farm_id, action.expenses, header);
    if (result) {
      yield put(enqueueSuccessSnackbar(i18n.t('message:EXPENSE.SUCCESS.ADD')));
      const result = yield call(axios.get, expenseUrl + '/farm/' + farm_id, header);
      if (result) {
        yield put(setExpense(result.data));
      }
    }
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:EXPENSE.ERROR.ADD')));
  }
}

export function* tempDeleteExpenseSaga(action) {
  const { expenseUrl } = apiConfig;
  const { expense_id } = action;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.delete, `${expenseUrl}/${expense_id}`, header);
    if (result) {
      yield put(enqueueSuccessSnackbar(i18n.t('message:EXPENSE.SUCCESS.DELETE')));
      history.push('/other_expense');
    }
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:EXPENSE.ERROR.DELETE')));
  }
}

export function* deleteExpensesSaga(action) {
  const { expenseUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.put, expenseUrl, action.ids, header);
    if (result) {
      yield put(enqueueSuccessSnackbar(i18n.t('message:EXPENSE.SUCCESS.DELETE')));
      const result = yield call(axios.get, expenseUrl + '/farm/' + farm_id, header);
      if (result) {
        yield put(setExpense(result.data));
      }
    }
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:EXPENSE.ERROR.DELETE')));
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
        yield put(enqueueSuccessSnackbar(i18n.t('message:EXPENSE.SUCCESS.UPDATE')));
        result = yield call(axios.get, expenseUrl + '/farm/' + farm_id, header);
        if (result) {
          yield put(setExpense(result.data));
        }
      }
    }
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:EXPENSE.ERROR.UPDATE')));
  }
}

export function* tempEditExpenseSaga(action) {
  const { expenseUrl } = apiConfig;
  const { expense_id, data } = action;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    let result = yield call(axios.patch, `${expenseUrl}/${expense_id}`, data, header);
    if (result) {
      yield put(enqueueSuccessSnackbar(i18n.t('message:EXPENSE.SUCCESS.UPDATE')));
      result = yield call(axios.get, `${expenseUrl}/farm/${farm_id}`, header);
      if (result) {
        yield put(setExpense(result.data));
      }
    }
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:EXPENSE.ERROR.UPDATE')));
  }
}

export const getRevenueTypes = createAction('getRevenueTypesSaga');

export function* getRevenueTypesSaga() {
  const { revenueTypeUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, `${revenueTypeUrl}/farm/${farm_id}`, header);

    yield put(getRevenueTypesSuccess(result.data));
  } catch (e) {
    console.log('failed to fetch revenue types from database');
  }
}

export const deleteRevenueType = createAction('deleteRevenueTypeSaga');

export function* deleteRevenueTypeSaga({ payload: id }) {
  const { revenueTypeUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    yield call(axios.delete, `${revenueTypeUrl}/${id}`, header);

    yield put(deleteRevenueTypeSuccess(id));
    yield put(enqueueSuccessSnackbar(i18n.t('message:REVENUE_TYPE.SUCCESS.DELETE')));
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:REVENUE_TYPE.ERROR.DELETE')));
  }
}

export const addCustomRevenueType = createAction('addRevenueTypeSaga');

export function* addRevenueTypeSaga({ payload: { revenue_name } }) {
  const { revenueTypeUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  const body = {
    revenue_name,
    farm_id: farm_id,
  };

  try {
    const result = yield call(axios.post, revenueTypeUrl, body, header);

    yield put(postRevenueTypeSuccess(result.data));
    yield put(enqueueSuccessSnackbar(i18n.t('message:REVENUE_TYPE.SUCCESS.ADD')));
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:REVENUE_TYPE.ERROR.ADD')));
  }
}

export const updateCustomRevenueType = createAction('updateRevenueTypeSaga');

export function* updateRevenueTypeSaga({ payload: { revenue_type_id, revenue_name } }) {
  const { revenueTypeUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    yield call(
      axios.patch,
      `${revenueTypeUrl}/${revenue_type_id}`,
      { revenue_name, farm_id },
      header,
    );

    yield put(putRevenueTypeSuccess({ revenue_type_id, revenue_name }));
    yield put(enqueueSuccessSnackbar(i18n.t('message:REVENUE_TYPE.SUCCESS.UPDATE')));
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:REVENUE_TYPE.ERROR.UPDATE')));
  }
}

export const patchEstimatedCropRevenue = createAction(`patchEstimatedCropRevenueSaga`);
export function* patchEstimatedCropRevenueSaga({ payload: managementPlan }) {
  const { managementPlanURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(
      axios.patch,
      managementPlanURL + `/${managementPlan.management_plan_id}`,
      managementPlan,
      header,
    );
    yield call(getManagementPlanAndPlantingMethodSuccessSaga, { payload: [managementPlan] });
    yield put(enqueueSuccessSnackbar(i18n.t('message:REVENUE.SUCCESS.EDIT')));
    history.push(`/estimated_revenue`);
  } catch (e) {
    console.log('Failed to update managementPlan to database');
    yield put(enqueueErrorSnackbar(i18n.t('message:REVENUE.ERROR.EDIT')));
  }
}

export default function* financeSaga() {
  yield takeLatest(GET_SALES, getSales);
  yield takeLeading(ADD_OR_UPDATE_SALE, addSale);
  yield takeLatest(GET_EXPENSE, getExpenseSaga);
  yield takeLatest(GET_FARM_EXPENSE_TYPE, getFarmExpenseTypeSaga);
  yield takeLeading(addCustomExpenseType.type, addCustomExpenseTypeSaga);
  yield takeLeading(updateCustomExpenseType.type, updateCustomExpenseTypeSaga);
  yield takeLeading(retireCustomExpenseType.type, retireCustomExpenseTypeSaga);
  yield takeLatest(getRevenueTypes.type, getRevenueTypesSaga);
  yield takeLatest(deleteRevenueType.type, deleteRevenueTypeSaga);
  yield takeLatest(addCustomRevenueType.type, addRevenueTypeSaga);
  yield takeLatest(updateCustomRevenueType.type, updateRevenueTypeSaga);
  yield takeLeading(ADD_EXPENSES, addExpensesSaga);
  yield takeLeading(DELETE_SALE, deleteSale);
  yield takeLeading(DELETE_EXPENSES, deleteExpensesSaga);
  yield takeLeading(TEMP_DELETE_EXPENSE, tempDeleteExpenseSaga);
  yield takeLeading(ADD_REMOVE_EXPENSE, addRemoveExpenseSaga);
  yield takeLeading(UPDATE_SALE, updateSaleSaga);
  yield takeLeading(TEMP_EDIT_EXPENSE, tempEditExpenseSaga);
  yield takeLeading(patchEstimatedCropRevenue.type, patchEstimatedCropRevenueSaga);
}
