import { call, put, select, takeLatest } from 'redux-saga/effects';
import apiConfig from '../../../../apiConfig';
import { loginSelector } from '../../../userFarmSlice';
import { axios, getHeader } from '../../../saga';
import { createAction } from '@reduxjs/toolkit';
import {
  editFieldSuccess,
  getLocationObjectFromField,
  postFieldSuccess,
} from '../../../fieldSlice';
import { canShowSuccessHeader, setSuccessMessage } from '../../../mapSlice';
import i18n from '../../../../locales/i18n';
import history from '../../../../history';
import { resetAndLockFormData } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';

export const postFieldLocation = createAction(`postFieldLocationSaga`);

export function* postFieldLocationSaga({ payload: data }) {
  const formData = data.formData;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromField(formData);

  try {
    const result = yield call(
      axios.post,
      `${locationURL}/${locationObject.figure.type}`,
      locationObject,
      header,
    );
    yield put(postFieldSuccess(result.data));
    yield put(resetAndLockFormData());
    yield put(
      setSuccessMessage([i18n.t('FARM_MAP.MAP_FILTER.FIELD'), i18n.t('message:MAP.SUCCESS_POST')]),
    );
    yield put(canShowSuccessHeader(true));
    history.push({ pathname: '/map' });
  } catch (e) {
    history.push({
      path: history.location.pathname,
      state: {
        error: `${i18n.t('message:MAP.FAIL_POST')} ${i18n
          .t('FARM_MAP.MAP_FILTER.FIELD')
          .toLowerCase()}`,
      },
    });
    console.log(e);
  }
}

export const editFieldLocation = createAction(`editFieldLocationSaga`);

export function* editFieldLocationSaga({ payload: data }) {
  const { formData, location_id } = data;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromField({ ...formData, location_id });

  try {
    const result = yield call(
      axios.put,
      `${locationURL}/${locationObject.figure.type}/${location_id}`,
      locationObject,
      header,
    );
    yield put(editFieldSuccess(result.data));
    yield put(resetAndLockFormData());
    yield put(
      setSuccessMessage([i18n.t('FARM_MAP.MAP_FILTER.FIELD'), i18n.t('message:MAP.SUCCESS_PATCH')]),
    );
    yield put(canShowSuccessHeader(true));
    history.push({ pathname: '/map' });
  } catch (e) {
    history.push({
      path: history.location.pathname,
      state: {
        error: `${i18n.t('message:MAP.FAIL_PATCH')} ${i18n
          .t('FARM_MAP.MAP_FILTER.FIELD')
          .toLowerCase()}`,
      },
    });
    console.log(e);
  }
}

export default function* fieldLocationSaga() {
  yield takeLatest(postFieldLocation.type, postFieldLocationSaga);
  yield takeLatest(editFieldLocation.type, editFieldLocationSaga);
}
