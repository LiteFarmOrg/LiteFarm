import { call, put, select, takeLeading } from 'redux-saga/effects';
import apiConfig from '../../../../apiConfig';
import { loginSelector } from '../../../userFarmSlice';
import { axios, getHeader } from '../../../saga';
import { createAction } from '@reduxjs/toolkit';
import {
  deleteWaterValveSuccess,
  editWaterValveSuccess,
  getLocationObjectFromWaterValve,
  postWaterValveSuccess,
} from '../../../waterValveSlice';
import { canShowSuccessHeader, setSuccessMessage } from '../../../mapSlice';
import { setMapCache } from '../../../Map/mapCacheSlice';
import i18n from '../../../../locales/i18n';
import { useLocation, useNavigate } from 'react-router';

export const postWaterValveLocation = createAction(`postWaterValveLocationSaga`);

export function* postWaterValveLocationSaga({ payload: data }) {
  let location = useLocation();
  const formData = data.formData;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromWaterValve(formData);

  try {
    const result = yield call(
      axios.post,
      `${locationURL}/${locationObject.figure.type}`,
      locationObject,
      header,
    );
    yield put(setMapCache({ maxZoom: undefined, farm_id }));
    yield put(postWaterValveSuccess(result.data));

    yield put(
      setSuccessMessage([i18n.t('FARM_MAP.MAP_FILTER.WV'), i18n.t('message:MAP.SUCCESS_POST')]),
    );
    yield put(canShowSuccessHeader(true));
    history.push('/map');
  } catch (e) {
    history.push(location.pathname, {
      error: `${i18n.t('message:MAP.FAIL_POST')} ${i18n.t('FARM_MAP.MAP_FILTER.WV').toLowerCase()}`,
    });
    console.log(e);
  }
}

export const editWaterValveLocation = createAction(`editWaterValveLocationSaga`);

export function* editWaterValveLocationSaga({ payload: data }) {
  let location = useLocation();
  const { formData, location_id, figure_id } = data;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromWaterValve({ ...formData, location_id, figure_id });

  try {
    const result = yield call(
      axios.put,
      `${locationURL}/${locationObject.figure.type}/${location_id}`,
      locationObject,
      header,
    );
    yield put(editWaterValveSuccess(result.data));

    yield put(
      setSuccessMessage([i18n.t('FARM_MAP.MAP_FILTER.WV'), i18n.t('message:MAP.SUCCESS_PATCH')]),
    );
    yield put(canShowSuccessHeader(true));
    history.push('/map');
  } catch (e) {
    history.push(location.pathname, {
      error: `${i18n.t('message:MAP.FAIL_PATCH')} ${i18n
        .t('FARM_MAP.MAP_FILTER.WV')
        .toLowerCase()}`,
    });
    console.log(e);
  }
}

export const deleteWaterValveLocation = createAction(`deleteWaterValveLocationSaga`);

export function* deleteWaterValveLocationSaga({ payload: data }) {
  let location = useLocation();
  const { location_id } = data;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.delete, `${locationURL}/${location_id}`, header);
    yield put(setMapCache({ maxZoom: undefined, farm_id }));
    yield put(deleteWaterValveSuccess(location_id));
    yield put(
      setSuccessMessage([i18n.t('FARM_MAP.MAP_FILTER.WV'), i18n.t('message:MAP.SUCCESS_DELETE')]),
    );
    yield put(canShowSuccessHeader(true));
    history.push('/map');
  } catch (e) {
    history.push(location.pathname, {
      error: {
        retire: true,
      },
    });
    console.log(e);
  }
}

export default function* waterValveLocationSaga() {
  yield takeLeading(postWaterValveLocation.type, postWaterValveLocationSaga);
  yield takeLeading(editWaterValveLocation.type, editWaterValveLocationSaga);
  yield takeLeading(deleteWaterValveLocation.type, deleteWaterValveLocationSaga);
}
