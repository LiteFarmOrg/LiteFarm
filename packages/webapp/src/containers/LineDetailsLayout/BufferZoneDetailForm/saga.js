import { call, put, select, takeEvery } from 'redux-saga/effects';
import apiConfig from '../../../apiConfig';
import { loginSelector } from '../../../containers/userFarmSlice';
import { getHeader } from '../../../containers/saga';
import { createAction } from '@reduxjs/toolkit';
import { getLocationObjectFromBufferZone, postBufferZoneSuccess } from '../../bufferZoneSlice';
import history from '../../../history';
import { canShowSuccessHeader, setSuccessMessage } from '../../mapSlice';
import i18n from '../../../locales/i18n';
import { resetAndLockFormData } from '../../hooks/useHookFormPersist/hookFormPersistSlice';

const axios = require('axios');
export const postBufferZoneLocation = createAction(`postBufferZoneLocationSaga`);

export function* postBufferZoneLocationSaga({ payload: data }) {
  const formData = data.formData;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromBufferZone(formData);

  try {
    const result = yield call(
      axios.post,
      `${locationURL}/${locationObject.figure.type}`,
      locationObject,
      header,
    );
    yield put(postBufferZoneSuccess(result.data));
    yield put(resetAndLockFormData());
    yield put(
      setSuccessMessage([i18n.t('FARM_MAP.MAP_FILTER.BZ'), i18n.t('message:MAP.SUCCESS_POST')]),
    );
    yield put(canShowSuccessHeader(true));
    history.push({ pathname: '/map' });
  } catch (e) {
    history.push({
      path: history.location.pathname,
      state: {
        error: `${i18n.t('message:MAP.FAIL_POST')} ${i18n
          .t('FARM_MAP.MAP_FILTER.BZ')
          .toLowerCase()}`,
      },
    });
    console.log(e);
  }
}

export default function* bufferZoneLocationSaga() {
  yield takeEvery(postBufferZoneLocation.type, postBufferZoneLocationSaga);
}
