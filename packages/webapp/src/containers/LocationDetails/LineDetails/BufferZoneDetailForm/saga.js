import { call, put, select, takeLeading } from 'redux-saga/effects';
import apiConfig from '../../../../apiConfig';
import { loginSelector } from '../../../userFarmSlice';
import { axios, getHeader } from '../../../saga';
import { createAction } from '@reduxjs/toolkit';
import {
  deleteBufferZoneSuccess,
  editBufferZoneSuccess,
  getLocationObjectFromBufferZone,
  postBufferZoneSuccess,
} from '../../../bufferZoneSlice';
import history from '../../../../history';
import { canShowSuccessHeader, setSuccessMessage } from '../../../mapSlice';
import i18n from '../../../../locales/i18n';
import { resetAndLockFormData } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';

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

export const editBufferZoneLocation = createAction(`editBufferZoneLocationSaga`);

export function* editBufferZoneLocationSaga({ payload: data }) {
  const { formData, location_id, figure_id } = data;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromBufferZone({ ...formData, location_id, figure_id });

  try {
    const result = yield call(
      axios.put,
      `${locationURL}/${locationObject.figure.type}/${location_id}`,
      locationObject,
      header,
    );
    yield put(editBufferZoneSuccess(result.data));
    yield put(resetAndLockFormData());
    yield put(
      setSuccessMessage([i18n.t('FARM_MAP.MAP_FILTER.BZ'), i18n.t('message:MAP.SUCCESS_PATCH')]),
    );
    yield put(canShowSuccessHeader(true));
    history.push({ pathname: '/map' });
  } catch (e) {
    history.push({
      path: history.location.pathname,
      state: {
        error: `${i18n.t('message:MAP.FAIL_PATCH')} ${i18n
          .t('FARM_MAP.MAP_FILTER.BZ')
          .toLowerCase()}`,
      },
    });
    console.log(e);
  }
}

export const deleteBufferZoneLocation = createAction(`deleteBufferZoneLocationSaga`);

export function* deleteBufferZoneLocationSaga({ payload: data }) {
  const { location_id } = data;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.delete, `${locationURL}/${location_id}`, header);
    yield put(deleteBufferZoneSuccess(location_id));
    yield put(
      setSuccessMessage([i18n.t('FARM_MAP.MAP_FILTER.BZ'), i18n.t('message:MAP.SUCCESS_DELETE')]),
    );
    yield put(canShowSuccessHeader(true));
    history.push({ pathname: '/map' });
  } catch (e) {
    history.push({
      path: history.location.pathname,
      state: {
        error: {
          retire: true,
        },
      },
    });
    console.log(e);
  }
}

export default function* bufferZoneLocationSaga() {
  yield takeLeading(postBufferZoneLocation.type, postBufferZoneLocationSaga);
  yield takeLeading(editBufferZoneLocation.type, editBufferZoneLocationSaga);
  yield takeLeading(deleteBufferZoneLocation.type, deleteBufferZoneLocationSaga);
}
