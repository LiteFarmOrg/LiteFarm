import { call, put, select, takeEvery } from 'redux-saga/effects';
import apiConfig from '../../../apiConfig';
import { loginSelector } from '../../../containers/userFarmSlice';
import { getHeader } from '../../../containers/saga';
import { createAction } from '@reduxjs/toolkit';
import { getLocationObjectFromWatercourse, postWatercourseSuccess } from '../../watercourseSlice';
import history from '../../../history';
import { canShowSuccessHeader, resetLocationData, setSuccessMessage } from '../../mapSlice';
import i18n from '../../../locales/i18n';

const axios = require('axios');
export const postWatercourseLocation = createAction(`postWatercourseLocationSaga`);

export function* postWatercourseLocationSaga({ payload: data }) {
  const formData = data.formData;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromWatercourse(formData);

  try {
    const result = yield call(
      axios.post,
      `${locationURL}/${locationObject.figure.type}`,
      locationObject,
      header,
    );
    yield put(postWatercourseSuccess(result.data));
    yield put(resetLocationData());
    yield put(
      setSuccessMessage([
        i18n.t('FARM_MAP.MAP_FILTER.WATERCOURSE'),
        i18n.t('message:MAP.SUCCESS_POST'),
      ]),
    );
    yield put(canShowSuccessHeader(true));
    history.push({ pathname: '/map' });
  } catch (e) {
    history.push({
      path: history.location.pathname,
      state: {
        error: `${i18n.t('message:MAP.FAIL_POST')} ${i18n
          .t('FARM_MAP.MAP_FILTER.WATERCOURSE')
          .toLowerCase()}`,
      },
    });
    console.log(e);
  }
}

export default function* watercourseLocationSaga() {
  yield takeEvery(postWatercourseLocation.type, postWatercourseLocationSaga);
}
