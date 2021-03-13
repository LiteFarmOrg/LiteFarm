import { call, select, takeEvery, put } from 'redux-saga/effects';
import apiConfig from '../../../apiConfig';
import { loginSelector } from '../../../containers/userFarmSlice';
import { getHeader } from '../../../containers/saga';
import { createAction } from '@reduxjs/toolkit';
import { getLocationObjectFromGate, postGateSuccess } from '../../gateSlice';

const axios = require('axios');
export const postGateLocation = createAction(`postGateLocationSaga`);

export function* postGateLocationSaga({ payload: data }) {
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  data.formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromGate(data.formData);

  try {
    const result = yield call(
      axios.post,
      locationURL + '/' + `${locationObject.figure.type}`,
      locationObject,
      header,
    );
    yield put(postGateSuccess(result.data));
  } catch (e) {
    console.log(e);
  }
}

export default function* gateLocationSaga() {
  yield takeEvery(postGateLocation.type, postGateLocationSaga);
}
