import { createAction } from '@reduxjs/toolkit';
import { userFarmSelector } from '../../userFarmSlice';
import { call, put, select, takeLeading, takeLatest } from 'redux-saga/effects';
import {
  irrigationTaskTypesFailure,
  irrigationTaskTypesLoading,
  irrigationTaskTypesSuccess,
} from '../../irrigationTaskTypesSlice';
import { axios, getHeader } from '../../saga';
import apiConfig from '../../../apiConfig';

export const getIrrigationTaskTypes = createAction(`getIrrigationTaskTypesSaga`);
export function* getIrrigationTaskTypesSaga() {
  console.log('test');
  const { farm_id, user_id } = yield select(userFarmSelector);
  const { taskUrl } = apiConfig;
  const header = getHeader(user_id, farm_id);
  try {
    yield put(irrigationTaskTypesLoading());
    const result = yield call(axios.get, `${taskUrl}/irrigation_task_types/${farm_id}`, header);
    yield put(irrigationTaskTypesSuccess({ irrigationTaskTypes: result.data }));
  } catch (e) {
    yield put(irrigationTaskTypesFailure());
    console.log(e);
  }
}

export default function* irrigationTaskTypeSaga() {
  yield takeLatest(getIrrigationTaskTypes.type, getIrrigationTaskTypesSaga);
}
