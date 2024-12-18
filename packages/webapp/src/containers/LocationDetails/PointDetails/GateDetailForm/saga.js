import { call, put, select, takeLeading } from 'redux-saga/effects';
import apiConfig from '../../../../apiConfig';
import { loginSelector } from '../../../userFarmSlice';
import { axios, getHeader } from '../../../saga';
import { createAction } from '@reduxjs/toolkit';
import {
  deleteGateSuccess,
  editGateSuccess,
  getLocationObjectFromGate,
  postGateSuccess,
} from '../../../gateSlice';
import { canShowSuccessHeader, setSuccessMessage } from '../../../mapSlice';
import { setMapCache } from '../../../Map/mapCacheSlice';
import i18n from '../../../../locales/i18n';
import { useLocation, useNavigate } from 'react-router-dom';

export const postGateLocation = createAction(`postGateLocationSaga`);

export function* postGateLocationSaga({ payload: data }) {
  let navigate = useNavigate();
  let location = useLocation();
  const formData = data.formData;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromGate(formData);

  try {
    const result = yield call(
      axios.post,
      `${locationURL}/${locationObject.figure.type}`,
      locationObject,
      header,
    );
    yield put(setMapCache({ maxZoom: undefined, farm_id }));
    yield put(postGateSuccess(result.data));

    yield put(
      setSuccessMessage([i18n.t('FARM_MAP.MAP_FILTER.GATE'), i18n.t('message:MAP.SUCCESS_POST')]),
    );
    yield put(canShowSuccessHeader(true));
    navigate('/map');
  } catch (e) {
    navigate(location.pathname, {
      state: {
        error: `${i18n.t('message:MAP.FAIL_POST')} ${i18n
          .t('FARM_MAP.MAP_FILTER.GATE')
          .toLowerCase()}`,
      },
    });
    console.log(e);
  }
}

export const editGateLocation = createAction(`editGateLocationSaga`);

export function* editGateLocationSaga({ payload: data }) {
  let navigate = useNavigate();
  let location = useLocation();
  const { formData, location_id, figure_id } = data;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromGate({ ...formData, location_id, figure_id });

  try {
    const result = yield call(
      axios.put,
      `${locationURL}/${locationObject.figure.type}/${location_id}`,
      locationObject,
      header,
    );
    yield put(editGateSuccess(result.data));

    yield put(
      setSuccessMessage([i18n.t('FARM_MAP.MAP_FILTER.GATE'), i18n.t('message:MAP.SUCCESS_PATCH')]),
    );
    yield put(canShowSuccessHeader(true));
    navigate('/map');
  } catch (e) {
    navigate(location.pathname, {
      state: {
        error: `${i18n.t('message:MAP.FAIL_PATCH')} ${i18n
          .t('FARM_MAP.MAP_FILTER.GATE')
          .toLowerCase()}`,
      },
    });
    console.log(e);
  }
}

export const deleteGateLocation = createAction(`deleteGateLocationSaga`);

export function* deleteGateLocationSaga({ payload: data }) {
  let navigate = useNavigate();
  let location = useLocation();
  const { location_id } = data;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.delete, `${locationURL}/${location_id}`, header);
    yield put(setMapCache({ maxZoom: undefined, farm_id }));
    yield put(deleteGateSuccess(location_id));
    yield put(
      setSuccessMessage([i18n.t('FARM_MAP.MAP_FILTER.GATE'), i18n.t('message:MAP.SUCCESS_DELETE')]),
    );
    yield put(canShowSuccessHeader(true));
    navigate('/map');
  } catch (e) {
    navigate(location.pathname, {
      state: {
        error: {
          retire: true,
        },
      },
    });
    console.log(e);
  }
}

export default function* gateLocationSaga() {
  yield takeLeading(postGateLocation.type, postGateLocationSaga);
  yield takeLeading(editGateLocation.type, editGateLocationSaga);
  yield takeLeading(deleteGateLocation.type, deleteGateLocationSaga);
}
