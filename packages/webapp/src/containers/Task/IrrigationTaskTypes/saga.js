import { createAction } from '@reduxjs/toolkit';
import { userFarmSelector } from '../../userFarmSlice';
import { call, put, select, takeLeading } from 'redux-saga/effects';
import {
  irrigationTaskTypesFailure,
  irrigationTaskTypesLoading,
  irrigationTaskTypesSuccess,
} from '../../irrigationTaskTypesSlice';
import { axios, getHeader } from '../../saga';
import apiConfig from '../../../apiConfig';

export const getIrrigationTaskTypes = createAction(`getIrrigationTaskTypesSaga`);
export function* getIrrigationTaskTypesSaga() {
  const { farm_id, user_id } = yield select(userFarmSelector);
  const { taskUrl } = apiConfig;
  console.log('test');
  try {
    yield put(irrigationTaskTypesLoading());
    const header = getHeader(user_id, farm_id);
    const result = yield call(axios.get, `${taskUrl}/irrigation_task_types/${farm_id}`, header);
    console.log(result);
    yield put(irrigationTaskTypesSuccess({ irrigationTaskTypes: result.data }));
  } catch (e) {
    yield put(irrigationTaskTypesFailure());
    console.log(e);
  }
}

export default function* irrigationTaskTypeSaga() {
  yield takeLeading(getIrrigationTaskTypes.type, getIrrigationTaskTypesSaga);
}
