import { call, put, select, takeEvery } from 'redux-saga/effects';
import apiConfig from '../../../apiConfig';
import { loginSelector } from '../../../containers/userFarmSlice';
import { getHeader } from '../../../containers/saga';
import { createAction } from '@reduxjs/toolkit';
import { getLocationObjectFromFence, postFenceSuccess } from '../../fenceSlice';
import history from '../../../history';
import { canShowSuccessHeader, setSuccessMessage } from '../../mapSlice';
import i18n from '../../../locales/i18n';
import { resetAndLockFormData } from '../../hooks/useHookFormPersist/hookFormPersistSlice';

const axios = require('axios');
export const postFenceLocation = createAction(`postFenceLocationSaga`);

export function* postFenceLocationSaga({ payload: data }) {
  const formData = data.formData;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromFence(formData);

  try {
    const result = yield call(
      axios.post,
      `${locationURL}/${locationObject.figure.type}`,
      locationObject,
      header,
    );
    yield put(postFenceSuccess(result.data));
    yield put(resetAndLockFormData());
    yield put(
      setSuccessMessage([i18n.t('FARM_MAP.MAP_FILTER.FENCE'), i18n.t('message:MAP.SUCCESS_POST')]),
    );
    yield put(canShowSuccessHeader(true));
    history.push({ pathname: '/map' });
  } catch (e) {
    history.push({
      path: history.location.pathname,
      state: {
        error: `${i18n.t('message:MAP.FAIL_POST')} ${i18n
          .t('FARM_MAP.MAP_FILTER.FENCE')
          .toLowerCase()}`,
      },
    });
    console.log(e);
  }
}

export default function* fenceLocationSaga() {
  yield takeEvery(postFenceLocation.type, postFenceLocationSaga);
}
