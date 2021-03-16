import { call, put, select, takeEvery } from 'redux-saga/effects';
import apiConfig from '../../../apiConfig';
import { loginSelector } from '../../userFarmSlice';
import { getHeader } from '../../saga';
import { createAction } from '@reduxjs/toolkit';
import { getLocationObjectFromField, postFieldSuccess } from '../../fieldSlice';
import { resetLocationData } from '../../mapSlice';
import history from '../../../history';

const axios = require('axios');
export const postFieldLocation = createAction(`postFieldLocationSaga`);

export function* postFieldLocationSaga({ payload: data }) {
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  data.formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromField(data.formData);

  try {
    const result = yield call(
      axios.post,
      `${locationURL}/${locationObject.figure.type}`,
      locationObject,
      header,
    );
    yield put(postFieldSuccess(result.data));
    yield put(resetLocationData());
    history.push({ pathname: '/map', state: true });
  } catch (e) {
    console.log(e);
  }
}

export default function* fieldLocationSaga() {
  yield takeEvery(postFieldLocation.type, postFieldLocationSaga);
}
