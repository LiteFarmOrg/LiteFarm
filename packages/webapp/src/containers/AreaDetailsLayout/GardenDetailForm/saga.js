import { call, put, select, takeEvery } from 'redux-saga/effects';
import apiConfig from '../../../apiConfig';
import { loginSelector } from '../../userFarmSlice';
import { getHeader } from '../../saga';
import { createAction } from '@reduxjs/toolkit';
import { getLocationObjectFromGarden, postGardenSuccess } from '../../gardenSlice';
import { canShowSuccessHeader, setSuccessMessage } from '../../mapSlice';
import history from '../../../history';
import i18n from '../../../locales/i18n';
import { resetAndLockFormData } from '../../hooks/useHookFormPersist/hookFormPersistSlice';

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
    yield put(resetAndLockFormData());
    yield put(
      setSuccessMessage([i18n.t('FARM_MAP.MAP_FILTER.GARDEN'), i18n.t('message:MAP.SUCCESS_POST')]),
    );
    yield put(canShowSuccessHeader(true));
    history.push('/map');
  } catch (e) {
    history.push({
      path: history.location.pathname,
      state: {
        error: `${i18n.t('message:MAP.FAIL_POST')} ${i18n
          .t('FARM_MAP.MAP_FILTER.GARDEN')
          .toLowerCase()}`,
      },
    });
    console.log(e);
  }
}

export default function* gardenLocationSaga() {
  yield takeEvery(postGardenLocation.type, postGardenLocationSaga);
}
