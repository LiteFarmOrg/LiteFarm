import { call, put, select, takeEvery } from 'redux-saga/effects';
import apiConfig from '../../../apiConfig';
import { loginSelector } from '../../../containers/userFarmSlice';
import { getHeader } from '../../../containers/saga';
import { createAction } from '@reduxjs/toolkit';
import {
  getLocationObjectFromFarmSiteBoundary,
  postFarmSiteBoundarySuccess,
} from '../../farmSiteBoundarySlice';
import history from '../../../history';
import { resetLocationData } from '../../mapSlice';

const axios = require('axios');
export const postFarmSiteLocation = createAction(`postFarmSiteBoundaryLocationSaga`);

export function* postFarmSiteBoundaryLocationSaga({ payload: data }) {
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  data.formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromFarmSiteBoundary(data.formData);

  try {
    const result = yield call(
      axios.post,
      `${locationURL}/${locationObject.figure.type}`,
      locationObject,
      header,
    );
    yield put(postFarmSiteBoundarySuccess(result.data));
    yield put(resetLocationData());
    history.push({ pathname: '/map', state: true });
  } catch (e) {
    console.log(e);
  }
}

export default function* farmSiteBoundaryLocationSaga() {
  yield takeEvery(postFarmSiteLocation.type, postFarmSiteBoundaryLocationSaga);
}
