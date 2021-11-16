import { call, put, select, takeLeading } from 'redux-saga/effects';
import apiConfig from '../../../../apiConfig';
import { loginSelector } from '../../../userFarmSlice';
import { axios, getHeader } from '../../../saga';
import { createAction } from '@reduxjs/toolkit';
import {
  deleteCeremonialSuccess,
  editCeremonialSuccess,
  getLocationObjectFromCeremonial,
  postCeremonialSuccess,
} from '../../../ceremonialSlice';
import { canShowSuccessHeader, setSuccessMessage } from '../../../mapSlice';
import i18n from '../../../../locales/i18n';
import history from '../../../../history';
import { resetAndLockFormData } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';

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
    yield put(resetAndLockFormData());
    yield put(
      setSuccessMessage([i18n.t('FARM_MAP.MAP_FILTER.CA'), i18n.t('message:MAP.SUCCESS_POST')]),
    );
    yield put(canShowSuccessHeader(true));
    history.push({ pathname: '/map' });
  } catch (e) {
    history.push({
      path: history.location.pathname,
      state: {
        error: `${i18n.t('message:MAP.FAIL_POST')} ${i18n
          .t('FARM_MAP.MAP_FILTER.CA')
          .toLowerCase()}`,
      },
    });
    console.log(e);
  }
}

export const editCeremonialLocation = createAction(`editCeremonialLocationSaga`);

export function* editCeremonialLocationSaga({ payload: data }) {
  const { formData, location_id, figure_id } = data;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromCeremonial({ ...formData, location_id, figure_id });

  try {
    const result = yield call(
      axios.put,
      `${locationURL}/${locationObject.figure.type}/${location_id}`,
      locationObject,
      header,
    );
    yield put(editCeremonialSuccess(result.data));
    yield put(resetAndLockFormData());
    yield put(
      setSuccessMessage([i18n.t('FARM_MAP.MAP_FILTER.CA'), i18n.t('message:MAP.SUCCESS_PATCH')]),
    );
    yield put(canShowSuccessHeader(true));
    history.push({ pathname: '/map' });
  } catch (e) {
    history.push({
      path: history.location.pathname,
      state: {
        error: `${i18n.t('message:MAP.FAIL_PATCH')} ${i18n
          .t('FARM_MAP.MAP_FILTER.CA')
          .toLowerCase()}`,
      },
    });
    console.log(e);
  }
}

export const deleteCeremonialLocation = createAction(`deleteCeremonialLocationSaga`);

export function* deleteCeremonialLocationSaga({ payload: data }) {
  const { location_id } = data;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.delete, `${locationURL}/${location_id}`, header);
    yield put(deleteCeremonialSuccess(location_id));
    yield put(
      setSuccessMessage([i18n.t('FARM_MAP.MAP_FILTER.CA'), i18n.t('message:MAP.SUCCESS_DELETE')]),
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

export default function* ceremonialLocationSaga() {
  yield takeLeading(postCeremonialLocation.type, postCeremonialLocationSaga);
  yield takeLeading(editCeremonialLocation.type, editCeremonialLocationSaga);
  yield takeLeading(deleteCeremonialLocation.type, deleteCeremonialLocationSaga);
}
