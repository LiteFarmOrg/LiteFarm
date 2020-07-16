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

import { GET_SALES, ADD_OR_UPDATE_SALE, GET_SHIFT_FINANCE, GET_DEFAULT_EXPENSE_TYPE, GET_EXPENSE, DELETE_SALE, ADD_EXPENSES, DELETE_EXPENSES, ADD_REMOVE_EXPENSE, UPDATE_SALE} from "./constants";
import { setSalesInState, setShifts, setExpense, setDefaultExpenseType} from './actions';
import { put, takeEvery, call } from 'redux-saga/effects';
import apiConfig from './../../apiConfig';
import {toastr} from "react-redux-toastr";
const axios = require('axios');

export function* getSales() {
  let farm_id = localStorage.getItem('farm_id');
  const { salesURL } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    const result = yield call(axios.get, salesURL + '/' + farm_id, header);
    if (result) {
      yield put(setSalesInState(result.data));
    }
  } catch(e) {
    console.log('failed to fetch fields from database')
  }
}

export function* addSale(action) {
  let farm_id = localStorage.getItem('farm_id');
  const { salesURL } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

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
  } catch(e) {
    console.log(`failed to ${addOrUpdateFail} sale`);
    toastr.error(`Failed to ${addOrUpdateFail} new Sale`);
  }
}

export function* updateSaleSaga(action) {
  let farm_id = localStorage.getItem('farm_id');
  const { salesURL } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    const result = yield call(axios.patch, salesURL, action.sale, header);
    if (result) {
      toastr.success(`Successfully updated sale!`);
      const result = yield call(axios.get, salesURL + '/' + farm_id, header);
      if (result) {
        yield put(setSalesInState(result.data));
      }
    }
  } catch(e) {
    console.log(`failed to update sale`);
    toastr.error(`Failed to update  Sale`);
  }
}


export function* deleteSale(action) {
  let farm_id = localStorage.getItem('farm_id');
  const { salesURL } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    const result = yield call(axios.delete, salesURL + "/" + action.sale.id, header);
    if (result) {
      const result = yield call(axios.get, salesURL + '/' + farm_id, header);
      if(result) {
        yield put(setSalesInState(result.data));
      }
      toastr.success(`Successfully deleted Sale!`);
    }
  } catch(e) {
    console.log(`failed to delete sale`);
    toastr.error(`Failed to delete new Sale`);
  }
}

export function* getShiftsSaga() {
  let farm_id = localStorage.getItem('farm_id');
  const { farmShiftUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    const result = yield call(axios.get, farmShiftUrl + farm_id, header);
    if (result) {
      yield put(setShifts(result.data));
    }
  } catch(e) {
    console.log('failed to fetch shifts from database')

  }
}

export function* getExpenseSaga() {
  let farm_id = localStorage.getItem('farm_id');
  const { expenseUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    const result = yield call(axios.get, expenseUrl + '/farm/' + farm_id, header);
    if (result) {
      yield put(setExpense(result.data));
    }
  } catch(e) {
    console.log('failed to fetch expenses from database')
  }
}

export function* getDefaultExpenseTypeSaga() {
  const { expenseTypeDefaultUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    const result = yield call(axios.get, expenseTypeDefaultUrl, header);
    if (result) {
      yield put(setDefaultExpenseType(result.data));
    }
  } catch(e) {
    console.log('failed to fetch expenses from database')
  }
}

export function* addExpensesSaga(action) {
  let farm_id = localStorage.getItem('farm_id');
  const { expenseUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    const result = yield call(axios.post, expenseUrl, action.expenses, header);
    if (result) {
      toastr.success(`Successfully added new expenses!`);
      const result = yield call(axios.get, expenseUrl + '/farm/' + farm_id, header);
      if (result) {
        yield put(setExpense(result.data));
      }
    }
  } catch(e) {
    toastr.error(`Failed to add new expenses`);
  }
}

export function* deleteExpensesSaga(action) {
  let farm_id = localStorage.getItem('farm_id');
  const { expenseUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    const result = yield call(axios.put, expenseUrl, action.ids, header);
    if (result) {
      toastr.success(`Successfully deleted expenses!`);
      const result = yield call(axios.get, expenseUrl + '/farm/' + farm_id, header);
      if (result) {
        yield put(setExpense(result.data));
      }
    }
  } catch(e) {
    toastr.error(`Failed to delete expenses`);
  }
}

export function* addRemoveExpenseSaga(action) {
  let farm_id = localStorage.getItem('farm_id');
  const { expenseUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    let addRemoveObj = action.addRemoveObj;
    let result = yield call(axios.put, expenseUrl, addRemoveObj.remove, header);
    if (result) {
       result = yield call(axios.post, expenseUrl, addRemoveObj.add, header);
      if(result){
        toastr.success(`Successfully updated expenses!`);
        const result = yield call(axios.get, expenseUrl + '/farm/' + farm_id, header);
        if (result) {
          yield put(setExpense(result.data));
        }
      }
    }
  } catch(e) {
    toastr.error(`Failed to update expenses`);
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
