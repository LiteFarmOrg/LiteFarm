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

import { call, put, select, takeLatest, takeLeading } from 'redux-saga/effects';
import apiConfig from './../../apiConfig';
import {
  ADD_TASK_TYPE,
  DELETE_SHIFT,
  GET_ALL_SHIFT,
  GET_SHIFTS,
  GET_TASK_TYPES,
  SUBMIT_MULTI_SHIFT,
  SUBMIT_SHIFT,
  UPDATE_SHIFT,
} from './constants';
import { getTaskTypes, setShifts, setTaskTypesInState } from './actions';
import history from '../../history';
import { loginSelector, userFarmSelector } from '../userFarmSlice';
import { axios, getHeader } from '../saga';
import i18n from '../../locales/i18n';
import { resetStepOne } from '../shiftSlice';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../Snackbar/snackbarSlice';

export function* addTaskTypeSaga(payload) {
  const { taskTypeUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  let taskName = payload.taskName;
  const body = {
    task_name: taskName,
    farm_id: farm_id,
  };

  try {
    const result = yield call(axios.post, taskTypeUrl, body, header);
    if (result) {
      yield put(getTaskTypes());
    }
  } catch (e) {
    console.error('failed to add task type');
  }
}

export function* addShift(action) {
  const { shiftUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  let shiftObj = action.shiftObj;

  try {
    // TODO: Modify the way tasks are being set their ids. Refactor STEP 2.
    const result = yield call(
      axios.post,
      shiftUrl,
      { ...shiftObj, farm_id: header.headers.farm_id },
      header,
    );
    if (result) {
      yield put(resetStepOne());
      history.push('/shift');
      yield put(enqueueSuccessSnackbar(i18n.t('message:SHIFT.SUCCESS.ADD')));
    }
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:SHIFT.ERROR.ADD')));
  }
}

export function* addMultiShiftSaga(action) {
  const { shiftUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  let shiftObj = action.shiftObj;

  try {
    const result = yield call(axios.post, shiftUrl + '/multi', shiftObj, header);
    if (result) {
      history.push('/shift');
      yield put(enqueueSuccessSnackbar(i18n.t('message:SHIFT.SUCCESS.ADD')));
    }
  } catch (e) {
    console.log('failed to add shift');
    yield put(enqueueErrorSnackbar(i18n.t('message:SHIFT.ERROR.ADD')));
  }
}

export function* getShiftsSaga() {
  const { shiftUrl } = apiConfig;
  let { user_id, farm_id, first_name, last_name } = yield select(userFarmSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, shiftUrl + '/user/' + user_id, header);
    if (result) {
      yield put(setShifts(result.data.map((shift) => ({ ...shift, first_name, last_name }))));
    }
  } catch (e) {
    console.error('failed to fetch shifts from database');
  }
}

export function* getAllShiftSaga() {
  const { farmShiftUrl, shiftUrl } = apiConfig;
  let { user_id, farm_id, role_id } = yield select(userFarmSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = [1, 2, 5].includes(role_id)
      ? yield call(axios.get, farmShiftUrl + farm_id, header)
      : yield call(axios.get, `${shiftUrl}/userFarm/${farm_id}`, header);
    if (result) {
      let allShifts = result.data;
      let sortedShifts = [];
      let dict = {};
      for (let shift of allShifts) {
        if (!dict.hasOwnProperty(shift.shift_id)) {
          dict[shift.shift_id] = shift;
          dict[shift.shift_id] = Object.assign(dict[shift.shift_id], {
            tasks: [
              {
                task_id: shift.task_id,
                duration: shift.duration,
                management_plan_id: shift.management_plan_id,
                location_id: shift.location_id,
                is_location: shift.is_location,
                shift_id: shift.shift_id,
              },
            ],
          });
        } else {
          dict[shift.shift_id].tasks.push({
            task_id: shift.task_id,
            duration: shift.duration,
            management_plan_id: shift.management_plan_id,
            location_id: shift.location_id,
            is_location: shift.is_location,
            shift_id: shift.shift_id,
          });
        }
      }
      let keys = Object.keys(dict);
      for (let k of keys) {
        sortedShifts.push(dict[k]);
      }
      yield put(setShifts(sortedShifts));
    }
  } catch (e) {
    console.error('failed to fetch shifts from database');
  }
}

export function* deleteShiftSaga(action) {
  const { shiftId } = action;
  const { shiftUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.delete, shiftUrl + '/' + shiftId, header);
    if (result) {
      yield put(enqueueSuccessSnackbar(i18n.t('message:SHIFT.SUCCESS.DELETE')));
      history.push('/shift');
    }
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:SHIFT.ERROR.DELETE')));
  }
}

export function* updateShiftSaga(action) {
  const { shiftID, shiftObj } = action;
  const { shiftUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    // TODO: Modify the way tasks are being set their ids. Refactor STEP 2.
    shiftObj.tasks.forEach((t) => (t.task_id = Number(t.task_id)));
    const result = yield call(
      axios.put,
      shiftUrl + '/' + shiftID,
      { ...shiftObj, farm_id },
      header,
    );
    if (result) {
      yield put(enqueueSuccessSnackbar(i18n.t('message:SHIFT.SUCCESS.UPDATE')));
      history.push('/shift');
    }
  } catch (e) {
    console.log('failed to add shift');
    yield put(enqueueErrorSnackbar(i18n.t('message:SHIFT.ERROR.UPDATE')));
  }
}

export default function* shiftSaga() {
  // yield takeLatest(GET_TASK_TYPES, getTaskTypesSaga);
  yield takeLeading(ADD_TASK_TYPE, addTaskTypeSaga);
  yield takeLeading(SUBMIT_SHIFT, addShift);
  yield takeLatest(GET_SHIFTS, getShiftsSaga);
  yield takeLeading(DELETE_SHIFT, deleteShiftSaga);
  yield takeLeading(UPDATE_SHIFT, updateShiftSaga);
  yield takeLatest(GET_ALL_SHIFT, getAllShiftSaga);
  yield takeLeading(SUBMIT_MULTI_SHIFT, addMultiShiftSaga);
}
