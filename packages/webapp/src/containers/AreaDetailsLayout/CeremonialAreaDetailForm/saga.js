import { call, put, select, takeEvery } from 'redux-saga/effects';
import apiConfig from '../../../apiConfig';
import { loginSelector } from '../../userFarmSlice';
import { getHeader } from '../../saga';
import { createAction } from '@reduxjs/toolkit';
import { getLocationObjectFromCeremonial, postCeremonialSuccess } from '../../ceremonialSlice';
import { resetLocationData, setSuccessMessage, canShowSuccessHeader } from '../../mapSlice';
import i18n from '../../../locales/i18n';
import history from '../../../history';

const axios = require('axios');
export const postCeremonialLocation = createAction(`postCeremonialLocationSaga`);

export function* postCeremonialLocationSaga({ payload: data }) {
  const formData = data.formData;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromCeremonial(formData);

  try {
    const result = yield call(
      axios.post,
      `${locationURL}/${locationObject.figure.type}`,
      locationObject,
      header,
    );
    yield put(postCeremonialSuccess(result.data));
    yield put(resetLocationData());
    yield put(
      setSuccessMessage([i18n.t('FARM_MAP.MAP_FILTER.CA'), i18n.t('message:MAP.SUCCESS_POST')]),
    );
    yield put(canShowSuccessHeader(true));
    history.push({ pathname: '/map' });
  } catch (e) {
    console.log(e);
  }
}

export default function* ceremonialLocationSaga() {
  yield takeEvery(postCeremonialLocation.type, postCeremonialLocationSaga);
}
