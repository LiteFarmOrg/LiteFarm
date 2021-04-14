import { call, put, select, takeLatest } from 'redux-saga/effects';
import apiConfig from '../../../../apiConfig';
import { loginSelector } from '../../../userFarmSlice';
import { axios, getHeader } from '../../../saga';
import { createAction } from '@reduxjs/toolkit';
import {
  editSurfaceWaterSuccess,
  getLocationObjectFromSurfaceWater,
  postSurfaceWaterSuccess,
  deleteSurfaceWaterSuccess,
} from '../../../surfaceWaterSlice';
import { canShowSuccessHeader, setSuccessMessage } from '../../../mapSlice';
import i18n from '../../../../locales/i18n';
import history from '../../../../history';
import { resetAndLockFormData } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';

export const postSurfaceWaterLocation = createAction(`postSurfaceWaterLocationSaga`);

export function* postSurfaceWaterLocationSaga({ payload: data }) {
  const formData = data.formData;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromSurfaceWater(formData);

  try {
    const result = yield call(
      axios.post,
      `${locationURL}/${locationObject.figure.type}`,
      locationObject,
      header,
    );
    yield put(postSurfaceWaterSuccess(result.data));
    yield put(
      setSuccessMessage([
        i18n.t('FARM_MAP.MAP_FILTER.SURFACE_WATER'),
        i18n.t('message:MAP.SUCCESS_POST'),
      ]),
    );
    yield put(canShowSuccessHeader(true));
    yield put(resetAndLockFormData());
    history.push({ pathname: '/map' });
  } catch (e) {
    history.push({
      path: history.location.pathname,
      state: {
        error: `${i18n.t('message:MAP.FAIL_POST')} ${i18n
          .t('FARM_MAP.MAP_FILTER.SURFACE_WATER')
          .toLowerCase()}`,
      },
    });
    console.log(e);
  }
}

export const editSurfaceWaterLocation = createAction(`editSurfaceWaterLocationSaga`);

export function* editSurfaceWaterLocationSaga({ payload: data }) {
  const { formData, location_id, figure_id } = data;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromSurfaceWater({ ...formData, location_id, figure_id });

  try {
    const result = yield call(
      axios.put,
      `${locationURL}/${locationObject.figure.type}/${location_id}`,
      locationObject,
      header,
    );
    yield put(editSurfaceWaterSuccess(result.data));
    yield put(resetAndLockFormData());
    yield put(
      setSuccessMessage([
        i18n.t('FARM_MAP.MAP_FILTER.SURFACE_WATER'),
        i18n.t('message:MAP.SUCCESS_PATCH'),
      ]),
    );
    yield put(canShowSuccessHeader(true));
    history.push({ pathname: '/map' });
  } catch (e) {
    history.push({
      path: history.location.pathname,
      state: {
        error: `${i18n.t('message:MAP.FAIL_PATCH')} ${i18n
          .t('FARM_MAP.MAP_FILTER.SURFACE_WATER')
          .toLowerCase()}`,
      },
    });
    console.log(e);
  }
}

export const deleteSurfaceWaterLocation = createAction(`deleteSurfaceWaterLocationSaga`);

export function* deleteSurfaceWaterLocationSaga({ payload: data }) {
  const { location_id } = data;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(
      axios.delete,
      `${locationURL}/${location_id}`,
      header,
    );
    yield put(deleteSurfaceWaterSuccess(location_id));
    yield put(
      setSuccessMessage([i18n.t('FARM_MAP.MAP_FILTER.SURFACE_WATER'), i18n.t('message:MAP.SUCCESS_DELETE')]),
    );
    yield put(canShowSuccessHeader(true));
    history.push({ pathname: '/map' });
  } catch (e) {
    history.push({
      path: history.location.pathname,
      state: {
        error: `${i18n.t('message:MAP.FAIL_DELETE')} ${i18n
          .t('FARM_MAP.MAP_FILTER.SURFACE_WATER')
          .toLowerCase()}`,
      },
    });
    console.log(e);
  }
}

export default function* surfaceWaterLocationSaga() {
  yield takeLatest(postSurfaceWaterLocation.type, postSurfaceWaterLocationSaga);
  yield takeLatest(editSurfaceWaterLocation.type, editSurfaceWaterLocationSaga);
  yield takeLatest(deleteSurfaceWaterLocation.type, deleteSurfaceWaterLocationSaga);
}
