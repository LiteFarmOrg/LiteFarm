import { call, put, select, takeLeading } from 'redux-saga/effects';
import apiConfig from '../../../../apiConfig';
import { loginSelector } from '../../../userFarmSlice';
import { axios, getHeader } from '../../../saga';
import { createAction } from '@reduxjs/toolkit';
import {
  deleteGreenhouseSuccess,
  editGreenhouseSuccess,
  getLocationObjectFromGreenHouse,
  postGreenhouseSuccess,
} from '../../../greenhouseSlice';
import { canShowSuccessHeader, setSuccessMessage } from '../../../mapSlice';
import i18n from '../../../../locales/i18n';
import { useLocation, useNavigate } from 'react-router';

export const postGreenhouseLocation = createAction(`postGreenhouseLocationSaga`);

export function* postGreenhouseLocationSaga({ payload: data }) {
  let navigate = useNavigate();
  let location = useLocation();
  const formData = data.formData;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromGreenHouse(formData);

  try {
    const result = yield call(
      axios.post,
      `${locationURL}/${locationObject.figure.type}`,
      locationObject,
      header,
    );
    yield put(postGreenhouseSuccess(result.data));

    yield put(
      setSuccessMessage([
        i18n.t('FARM_MAP.MAP_FILTER.GREENHOUSE'),
        i18n.t('message:MAP.SUCCESS_POST'),
      ]),
    );
    yield put(canShowSuccessHeader(true));
    navigate('/map');
  } catch (e) {
    navigate(location.pathname, {
      state: {
        error: `${i18n.t('message:MAP.FAIL_POST')} ${i18n
          .t('FARM_MAP.MAP_FILTER.GREENHOUSE')
          .toLowerCase()}`,
      },
    });
    console.log(e);
  }
}

export const editGreenhouseLocation = createAction(`editGreenhouseLocationSaga`);

export function* editGreenhouseLocationSaga({ payload: data }) {
  let navigate = useNavigate();
  let location = useLocation();
  const { formData, location_id, figure_id } = data;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromGreenHouse({ ...formData, location_id, figure_id });

  try {
    const result = yield call(
      axios.put,
      `${locationURL}/${locationObject.figure.type}/${location_id}`,
      locationObject,
      header,
    );
    yield put(editGreenhouseSuccess(result.data));

    yield put(
      setSuccessMessage([
        i18n.t('FARM_MAP.MAP_FILTER.GREENHOUSE'),
        i18n.t('message:MAP.SUCCESS_PATCH'),
      ]),
    );
    yield put(canShowSuccessHeader(true));
    navigate('/map');
  } catch (e) {
    navigate(location.pathname, {
      state: {
        error: `${i18n.t('message:MAP.FAIL_PATCH')} ${i18n
          .t('FARM_MAP.MAP_FILTER.GREENHOUSE')
          .toLowerCase()}`,
      },
    });
    console.log(e);
  }
}

export const deleteGreenhouseLocation = createAction(`deleteGreenhouseLocationSaga`);

export function* deleteGreenhouseLocationSaga({ payload: data }) {
  let navigate = useNavigate();
  let location = useLocation();
  const { location_id } = data;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.delete, `${locationURL}/${location_id}`, header);
    yield put(deleteGreenhouseSuccess(location_id));
    yield put(
      setSuccessMessage([
        i18n.t('FARM_MAP.MAP_FILTER.GREENHOUSE'),
        i18n.t('message:MAP.SUCCESS_DELETE'),
      ]),
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

export default function* greenhouseLocationSaga() {
  yield takeLeading(postGreenhouseLocation.type, postGreenhouseLocationSaga);
  yield takeLeading(editGreenhouseLocation.type, editGreenhouseLocationSaga);
  yield takeLeading(deleteGreenhouseLocation.type, deleteGreenhouseLocationSaga);
}
