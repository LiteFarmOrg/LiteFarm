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

import { put, takeEvery, call } from 'redux-saga/effects';
import apiConfig from './../../apiConfig';
import {
  GET_TASK_TYPES, ADD_TASK_TYPE, SUBMIT_SHIFT, GET_SHIFTS, DELETE_SHIFT, UPDATE_SHIFT,
  GET_ALL_SHIFT, SUBMIT_MULTI_SHIFT,
} from "./constants";
import {setTaskTypesInState, getTaskTypes, setShifts} from "./actions";
import {toastr} from "react-redux-toastr";
import history from '../../history';
const axios = require('axios');


export function* getTaskTypesSaga() {
  let farm_id = localStorage.getItem('farm_id');
  const { taskTypeUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    const result = yield call(axios.get, taskTypeUrl + '/farm/' + farm_id, header);
    if (result) {
      yield put(setTaskTypesInState(result.data));
    }
  } catch(e) {
    console.log('failed to fetch task types from database')
  }
}

export function* addTaskTypeSaga(payload) {
  let farm_id = localStorage.getItem('farm_id');
  const { taskTypeUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  let taskName = payload.taskName;
  const body = {
    task_name: taskName,
    farm_id: farm_id
  };

  try {
    const result = yield call(axios.post, taskTypeUrl, body, header);
    if (result) {
      yield put(getTaskTypes());
    }
  } catch(e) {
    console.error('failed to add task type');
  }
}

export function* addShift(action) {
  const { shiftUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };
  let shiftObj = action.shiftObj;

  try {
    const result = yield call(axios.post, shiftUrl, shiftObj, header);
    if (result) {
      history.push('/shift');
      toastr.success('Successfully added new shift!');
    }
  } catch(e) {
    console.log('failed to add shift');
    toastr.error('Failed to add new shift');
  }
}

export function* addMultiShiftSaga(action) {
  const { shiftUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };
  let shiftObj = action.shiftObj;

  try {
    const result = yield call(axios.post, shiftUrl + '/multi', shiftObj, header);
    if (result) {
      history.push('/shift');
      toastr.success('Successfully added new shift!');
    }
  } catch(e) {
    console.log('failed to add shift');
    toastr.error('Failed to add new shift');
  }
}

export function* getShiftsSaga() {
  const user_id = localStorage.getItem('user_id');
  const { shiftUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    const result = yield call(axios.get, shiftUrl + '/user/' + user_id, header);
    if (result) {
      yield put(setShifts(result.data));
    }
  } catch(e) {
    console.error('failed to fetch shifts from database')
  }
}

export function* getAllShiftSaga() {
  const farm_id = localStorage.getItem('farm_id');
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
      let allShifts = result.data;
      let sortedShifts = [];
      let dict = {};
      for(let shift of allShifts){
        if(!dict.hasOwnProperty(shift.shift_id)){
          dict[shift.shift_id] = shift;
          dict[shift.shift_id] = Object.assign(dict[shift.shift_id], {tasks: [{
              task_id: shift.task_id,
              duration: shift.duration,
              field_crop_id: shift.field_crop_id,
              field_id: shift.field_id,
              is_field: shift.is_field,
              shift_id: shift.shift_id,
            }]})
        }else{
          dict[shift.shift_id].tasks.push({
            task_id: shift.task_id,
            duration: shift.duration,
            field_crop_id: shift.field_crop_id,
            field_id: shift.field_id,
            is_field: shift.is_field,
            shift_id: shift.shift_id,
          })
        }
      }
      let keys = Object.keys(dict);
      for(let k of keys){
        sortedShifts.push(dict[k]);
      }
      yield put(setShifts(sortedShifts));
    }
  } catch(e) {
    console.error('failed to fetch shifts from database')
  }
}

export function* deleteShiftSaga(action) {
  const { shiftId } = action;
  const { shiftUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    const result = yield call(axios.delete, shiftUrl + '/' + shiftId, header);
    if (result) {
      toastr.success('Deleted shift!');
      history.push('/shift');
    }
  } catch(e) {
    toastr.error('Failed to delete the shift :(');
  }
}

export function* updateShiftSaga(action) {
  const { shiftID, shiftObj } = action;
  const { shiftUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    const result = yield call(axios.put, shiftUrl + '/' + shiftID, shiftObj, header);
    if (result) {
      toastr.success('Successfully updated shift!');
      history.push('/shift');
    }
  } catch(e) {
    console.log('failed to add shift');
    toastr.error('Failed to update shift');
  }
}

export default function* shiftSaga() {
  yield takeEvery(GET_TASK_TYPES, getTaskTypesSaga);
  yield takeEvery(ADD_TASK_TYPE, addTaskTypeSaga);
  yield takeEvery(SUBMIT_SHIFT, addShift);
  yield takeEvery(GET_SHIFTS, getShiftsSaga);
  yield takeEvery(DELETE_SHIFT, deleteShiftSaga);
  yield takeEvery(UPDATE_SHIFT, updateShiftSaga);
  yield takeEvery(GET_ALL_SHIFT, getAllShiftSaga);
  yield takeEvery(SUBMIT_MULTI_SHIFT, addMultiShiftSaga);
}
