import { call, put, select, takeLeading } from 'redux-saga/effects';
import apiConfig from '../../../../apiConfig';
import { loginSelector } from '../../../userFarmSlice';
import { axios, getHeader } from '../../../saga';
import { createAction } from '@reduxjs/toolkit';
import {
  deleteFieldSuccess,
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
  let newLocationId;

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
    newLocationId = result.data.location_id;
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

  if (newLocationId) {
    try {
      yield call(
        axios.post,
        `${locationURL}/${newLocationId}/organic_history`,
        { location_id: newLocationId, to_state: locationObject.field.organic_status, effective_date: new Date() },
        header,
      );
    } catch (e) {
      // TODO error handling?
      console.log(e);
    }
  }
}

export const editFieldLocation = createAction(`editFieldLocationSaga`);

export function* editFieldLocationSaga({ payload: data }) {
  const { formData, location_id, figure_id } = data;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromField({ ...formData, location_id, figure_id });

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

  // LF-2066
  // For the time being when a user changes the status on the existing UI, ...
  // it should [update] the location and POST a new entry in the organic history table. 
  // For now, we’ll assume the day the change is made is the “effective date”. 
  if (/* organic status was changed is */true) { //TODO how to determine this?
    try {
      yield call(
        axios.post,
        `${locationURL}/${location_id}/organic_history`,
        { location_id, to_state: locationObject.field.organic_status, effective_date: new Date() },
        header,
      );
    } catch (e) {
      // TODO error handling?
      console.log(e);
    }
  }
}

export const deleteFieldLocation = createAction(`deleteFieldLocationSaga`);

export function* deleteFieldLocationSaga({ payload: data }) {
  const { location_id } = data;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.delete, `${locationURL}/${location_id}`, header);
    yield put(deleteFieldSuccess(location_id));
    yield put(
      setSuccessMessage([
        i18n.t('FARM_MAP.MAP_FILTER.FIELD'),
        i18n.t('message:MAP.SUCCESS_DELETE'),
      ]),
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

export default function* fieldLocationSaga() {
  yield takeLeading(postFieldLocation.type, postFieldLocationSaga);
  yield takeLeading(editFieldLocation.type, editFieldLocationSaga);
  yield takeLeading(deleteFieldLocation.type, deleteFieldLocationSaga);
}
