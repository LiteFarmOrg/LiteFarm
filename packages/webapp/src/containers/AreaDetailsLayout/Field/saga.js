import { call, put, select, takeEvery } from 'redux-saga/effects';
import apiConfig from '../../../apiConfig';
import { loginSelector } from '../../../containers/userFarmSlice';
import { getHeader } from '../../../containers/saga';
import { createAction } from '@reduxjs/toolkit';
import { getLocationObjectFromField, postFieldSuccess } from '../../fieldSlice';
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
      locationURL + '/' + `${locationObject.figure.type}`,
      locationObject,
      header,
    );
    yield put(postFieldSuccess(result.data));
    history.push('/map');
  } catch (e) {
    console.log(e);
  }
}

export default function* fieldLocationSaga() {
  yield takeEvery(postFieldLocation.type, postFieldLocationSaga);
}
