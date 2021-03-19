import { call, put, select, takeEvery } from 'redux-saga/effects';
import apiConfig from '../../../apiConfig';
import { loginSelector } from '../../userFarmSlice';
import { getHeader } from '../../saga';
import { createAction } from '@reduxjs/toolkit';
import { getLocationObjectFromGarden, postGardenSuccess } from '../../gardenSlice';
import { resetLocationData } from '../../mapSlice';
import history from '../../../history';

const axios = require('axios');
export const postGardenLocation = createAction(`postGardenLocationSaga`);

export function* postGardenLocationSaga({ payload: data }) {
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  data.formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromGarden(data.formData);

  try {
    const result = yield call(
      axios.post,
      `${locationURL}/${locationObject.figure.type}`,
      locationObject,
      header,
    );
    yield put(postGardenSuccess(result.data));
    yield put(resetLocationData());
    history.push('/map');
  } catch (e) {
    console.log(e);
  }
}

export default function* gardenLocationSaga() {
  yield takeEvery(postGardenLocation.type, postGardenLocationSaga);
}
