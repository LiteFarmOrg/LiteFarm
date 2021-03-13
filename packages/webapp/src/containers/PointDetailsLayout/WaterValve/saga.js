import { call, select, takeEvery, put } from 'redux-saga/effects';
import apiConfig from '../../../apiConfig';
import { loginSelector } from '../../../containers/userFarmSlice';
import { getHeader } from '../../../containers/saga';
import { createAction } from '@reduxjs/toolkit';
import { getLocationObjectFromWaterValve, postWaterValveSuccess } from '../../waterValveSlice';

const axios = require('axios');
export const postWaterValveLocation = createAction(`postWaterValveLocationSaga`);

export function* postWaterValveLocationSaga({ payload: data }) {
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  data.formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromWaterValve(data.formData);

  try {
    const result = yield call(
      axios.post,
      locationURL + '/' + `${locationObject.figure.type}`,
      locationObject,
      header,
    );
    yield put(postWaterValveSuccess(result.data));
  } catch (e) {
    console.log(e);
  }
}

export default function* waterValveLocationSaga() {
  yield takeEvery(postWaterValveLocation.type, postWaterValveLocationSaga);
}
