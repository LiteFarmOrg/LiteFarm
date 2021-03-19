import { call, select, takeEvery, put } from 'redux-saga/effects';
import apiConfig from '../../../apiConfig';
import { loginSelector } from '../../userFarmSlice';
import { getHeader } from '../../saga';
import { createAction } from '@reduxjs/toolkit';
import { getLocationObjectFromGate, postGateSuccess } from '../../gateSlice';
import history from '../../../history';
import { resetLocationData } from '../../mapSlice';

const axios = require('axios');
export const postGateLocation = createAction(`postGateLocationSaga`);

export function* postGateLocationSaga({ payload: data }) {
  const formData = data.form.formData;
  const message = data.message;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromGate(formData);

  try {
    const result = yield call(
      axios.post,
      `${locationURL}/${locationObject.figure.type}`,
      locationObject,
      header,
    );
    yield put(postGateSuccess(result.data));
    yield put(resetLocationData());
    history.push({ pathname: '/map', state: message });
  } catch (e) {
    console.log(e);
  }
}

export default function* gateLocationSaga() {
  yield takeEvery(postGateLocation.type, postGateLocationSaga);
}
