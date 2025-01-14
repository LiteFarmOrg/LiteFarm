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

import { createAction } from '@reduxjs/toolkit';
import { saveAs } from 'file-saver';
import { all, call, put, select, takeLatest, takeLeading } from 'redux-saga/effects';
import { dateRangeOptions } from '../../components/DateRangeSelector/constants';
import history from '../../history';
import i18n from '../../locales/i18n';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../Snackbar/snackbarSlice';
import { resetTransactionsFilter } from '../filterSlice';
import {
  deleteRevenueTypeSuccess,
  getRevenueTypesSuccess,
  postRevenueTypeSuccess,
  putRevenueTypeSuccess,
} from '../revenueTypeSlice';
import {
  axios,
  getHeader,
  getManagementPlanAndPlantingMethodSuccessSaga,
  getManagementPlansAndTasksSaga,
} from '../saga';
import { loginSelector, userFarmSelector } from '../userFarmSlice';
import apiConfig from './../../apiConfig';
import {
  setDateRange,
  setExpense,
  setExpenseType,
  setIsFetchingData,
  setSalesInState,
  setSelectedExpenseTypes,
} from './actions';
import {
  ADD_EXPENSES,
  ADD_REMOVE_EXPENSE,
  ADD_SALE,
  DELETE_EXPENSE,
  DELETE_EXPENSES,
  DELETE_SALE,
  GET_EXPENSE,
  GET_FARM_EXPENSE_TYPE,
  UPDATE_SALE,
} from './constants';
import {
  ESTIMATED_REVENUE_URL,
  FINANCES_HOME_URL,
  MANAGE_CUSTOM_EXPENSES_URL,
  MANAGE_CUSTOM_REVENUES_URL,
  OTHER_EXPENSE_URL,
} from '../../util/siteMapConstants';

export const getSales = createAction('getSales');

export function* getSalesSaga() {
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

  try {
    const result = yield call(axios.post, salesURL, action.sale, header);
    yield put(enqueueSuccessSnackbar(i18n.t('message:SALE.SUCCESS.ADD')));
    yield call(getSalesSaga);
    history.push(FINANCES_HOME_URL);
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:SALE.ERROR.ADD')));
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
    yield call(axios.patch, `${salesURL}/${sale_id}`, sale, header);
    yield put(enqueueSuccessSnackbar(i18n.t('message:SALE.SUCCESS.UPDATE')));
    yield call(getSalesSaga);
    history.push(FINANCES_HOME_URL);
  } catch (e) {
    console.log(`failed to update sale`);
    switch (e.response.data) {
      case 'sale deleted':
        yield put(enqueueErrorSnackbar(i18n.t('message:SALE.ERROR.SALE_DELETED')));
        history.push(FINANCES_HOME_URL);
        break;
      case 'revenue type deleted':
        yield put(enqueueErrorSnackbar(i18n.t('message:REVENUE.ERROR.REVENUE_TYPE_DELETED')));
        break;
      default:
        yield put(enqueueErrorSnackbar(i18n.t('message:SALE.ERROR.UPDATE')));
    }
  }
}

export function* deleteSale(action) {
  const { salesURL } = apiConfig;
  const { sale_id } = action;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    yield call(axios.delete, salesURL + '/' + sale_id, header);
    yield put(enqueueSuccessSnackbar(i18n.t('message:SALE.SUCCESS.DELETE')));
    yield call(getSalesSaga);
    history.push(FINANCES_HOME_URL);
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

export function* addCustomExpenseTypeSaga({ payload: { expense_name, custom_description } }) {
  const { expenseTypeUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(
      axios.post,
      expenseTypeUrl,
      { farm_id, expense_name, custom_description },
      header,
    );
    if (result) {
      yield put(enqueueSuccessSnackbar(i18n.t('message:EXPENSE_TYPE.SUCCESS.ADD')));
      yield call(getFarmExpenseTypeSaga);
      history.push(MANAGE_CUSTOM_EXPENSES_URL);
    }
  } catch (e) {
    console.log('failed to add new expense type to the database');
    yield put(enqueueErrorSnackbar(i18n.t('message:EXPENSE_TYPE.ERROR.ADD')));
  }
}

export const updateCustomExpenseType = createAction('updateCustomExpenseTypeSaga');

export function* updateCustomExpenseTypeSaga({
  payload: { expense_name, expense_type_id, custom_description },
}) {
  const { expenseTypeUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(
      axios.patch,
      `${expenseTypeUrl}/${expense_type_id}`,
      { farm_id, expense_name, custom_description },
      header,
    );
    if (result) {
      yield put(enqueueSuccessSnackbar(i18n.t('message:EXPENSE_TYPE.SUCCESS.UPDATE')));
      yield call(getFarmExpenseTypeSaga);
      history.push(MANAGE_CUSTOM_EXPENSES_URL);
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
      history.push(MANAGE_CUSTOM_EXPENSES_URL);
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

export function* deleteExpenseSaga(action) {
  const { expenseUrl } = apiConfig;
  const { expense_id } = action;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.delete, `${expenseUrl}/${expense_id}`, header);
    if (result) {
      yield put(enqueueSuccessSnackbar(i18n.t('message:EXPENSE.SUCCESS.DELETE')));
      history.push(FINANCES_HOME_URL);
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

export const updateExpense = createAction('editExpenseSaga');

export function* editExpenseSaga(action) {
  const { expenseUrl } = apiConfig;
  const { expense_id, data } = action.payload;

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
    history.push(FINANCES_HOME_URL);
  } catch (e) {
    console.log(e);
    switch (e.response.data) {
      case 'expense deleted':
        yield put(enqueueErrorSnackbar(i18n.t('message:EXPENSE.ERROR.EXPENSE_DELETED')));
        history.push(FINANCES_HOME_URL);
        break;
      case 'expense type deleted':
        yield put(enqueueErrorSnackbar(i18n.t('message:EXPENSE.ERROR.EXPENSE_TYPE_DELETED')));
        break;
      default:
        yield put(enqueueErrorSnackbar(i18n.t('message:SALE.ERROR.UPDATE')));
    }
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
    const result = yield call(axios.delete, `${revenueTypeUrl}/${id}`, header);

    const { deleted, retired } = result.data;

    yield put(deleteRevenueTypeSuccess({ revenue_type_id: id, deleted, retired }));

    yield put(enqueueSuccessSnackbar(i18n.t('message:REVENUE_TYPE.SUCCESS.DELETE')));
    history.push(MANAGE_CUSTOM_REVENUES_URL);
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:REVENUE_TYPE.ERROR.DELETE')));
  }
}

export const addCustomRevenueType = createAction('addRevenueTypeSaga');

export function* addRevenueTypeSaga({
  payload: { revenue_name, crop_generated, custom_description },
}) {
  const { revenueTypeUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  const body = {
    revenue_name,
    agriculture_associated: null,
    crop_generated,
    farm_id: farm_id,
    custom_description,
  };

  try {
    const result = yield call(axios.post, revenueTypeUrl, body, header);

    yield put(postRevenueTypeSuccess(result.data));
    yield put(enqueueSuccessSnackbar(i18n.t('message:REVENUE_TYPE.SUCCESS.ADD')));
    history.push(MANAGE_CUSTOM_REVENUES_URL);
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:REVENUE_TYPE.ERROR.ADD')));
  }
}

export const updateCustomRevenueType = createAction('updateRevenueTypeSaga');

export function* updateRevenueTypeSaga({
  payload: { revenue_type_id, revenue_name, custom_description },
}) {
  const { revenueTypeUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    yield call(
      axios.patch,
      `${revenueTypeUrl}/${revenue_type_id}`,
      { revenue_name, farm_id, custom_description },
      header,
    );

    yield put(putRevenueTypeSuccess({ revenue_type_id, revenue_name, custom_description }));
    yield put(enqueueSuccessSnackbar(i18n.t('message:REVENUE_TYPE.SUCCESS.UPDATE')));
    history.push(MANAGE_CUSTOM_REVENUES_URL);
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
    history.push(ESTIMATED_REVENUE_URL);
  } catch (e) {
    console.log('Failed to update managementPlan to database');
    yield put(enqueueErrorSnackbar(i18n.t('message:REVENUE.ERROR.EDIT')));
  }
}

export const downloadFinanceReport = createAction('downloadFinanceReportSaga');

export function* downloadFinanceReportSaga({ payload: data }) {
  const { financeReportUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  const { farm_name } = yield select(userFarmSelector);
  try {
    const result = yield call(
      axios.post,
      `${financeReportUrl}/farm/${farm_id}`,
      { ...data, farm_id },
      {
        ...header,
        responseType: 'arraybuffer',
      },
    );
    const blob = new Blob([result.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const fileName = farm_name
      ? `${farm_name} ${i18n.t('FINANCES.REPORT.FILE_TITLE')} ${
          data.config.dateFilter.startDate
        } - ${data.config.dateFilter.endDate}.xlsx`
      : `finance-report.xlsx`;
    saveAs(blob, fileName);
  } catch (e) {
    console.log(e);
  }
}

export const fetchAllData = createAction('fetchAllData');

export function* fetchAllDataSaga() {
  yield put(setIsFetchingData(true));
  yield all([
    call(getFarmExpenseTypeSaga),
    call(getRevenueTypesSaga),
    call(getSalesSaga),
    call(getExpenseSaga),
    call(getManagementPlansAndTasksSaga),
  ]);
  yield put(setSelectedExpenseTypes([]));
  yield put(resetTransactionsFilter());
  yield put(setDateRange({ option: dateRangeOptions.YEAR_TO_DATE }));
  yield put(setIsFetchingData(false));
}

export default function* financeSaga() {
  yield takeLatest(getSales.type, getSalesSaga);
  yield takeLeading(ADD_SALE, addSale);
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
  yield takeLeading(DELETE_EXPENSE, deleteExpenseSaga);
  yield takeLeading(ADD_REMOVE_EXPENSE, addRemoveExpenseSaga);
  yield takeLeading(UPDATE_SALE, updateSaleSaga);
  yield takeLeading(updateExpense.type, editExpenseSaga);
  yield takeLeading(patchEstimatedCropRevenue.type, patchEstimatedCropRevenueSaga);
  yield takeLeading(downloadFinanceReport.type, downloadFinanceReportSaga);
  yield takeLatest(fetchAllData.type, fetchAllDataSaga);
}
