import { call, put, select, takeLatest } from 'redux-saga/effects';
import apiConfig from '../../../../apiConfig';
import { loginSelector } from '../../../userFarmSlice';
import { axios, getHeader } from '../../../saga';
import { createAction } from '@reduxjs/toolkit';
import {
  editGardenSuccess,
  getLocationObjectFromGarden,
  postGardenSuccess,
  deleteGardenSuccess,
} from '../../../gardenSlice';
import { canShowSuccessHeader, setSuccessMessage } from '../../../mapSlice';
import history from '../../../../history';
import i18n from '../../../../locales/i18n';
import { resetAndLockFormData } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';

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

export const editGardenLocation = createAction(`editGardenLocationSaga`);

export function* editGardenLocationSaga({ payload: data }) {
  const { formData, location_id, figure_id } = data;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromGarden({ ...formData, location_id, figure_id });

  try {
    const result = yield call(
      axios.put,
      `${locationURL}/${locationObject.figure.type}/${location_id}`,
      locationObject,
      header,
    );
    yield put(editGardenSuccess(result.data));
    yield put(resetAndLockFormData());
    yield put(
      setSuccessMessage([
        i18n.t('FARM_MAP.MAP_FILTER.GARDEN'),
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
          .t('FARM_MAP.MAP_FILTER.GARDEN')
          .toLowerCase()}`,
      },
    });
    console.log(e);
  }
}

export const deleteGardenLocation = createAction(`deleteGardenLocationSaga`);

export function* deleteGardenLocationSaga({ payload: data }) {
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
    yield put(deleteGardenSuccess(location_id));
    yield put(
      setSuccessMessage([i18n.t('FARM_MAP.MAP_FILTER.GARDEN'), i18n.t('message:MAP.SUCCESS_DELETE')]),
    );
    yield put(canShowSuccessHeader(true));
    history.push({ pathname: '/map' });
  } catch (e) {
    history.push({
      path: history.location.pathname,
      state: {
        error: {
          retire: true
        }
      },
    });
    console.log(e);
  }
}

export default function* gardenLocationSaga() {
  yield takeLatest(postGardenLocation.type, postGardenLocationSaga);
  yield takeLatest(editGardenLocation.type, editGardenLocationSaga);
  yield takeLatest(deleteGardenLocation.type, deleteGardenLocationSaga);
}
