import { call, put, select, takeLeading } from 'redux-saga/effects';
import apiConfig from '../../../../apiConfig';
import { loginSelector } from '../../../userFarmSlice';
import { axios, getHeader } from '../../../saga';
import { createAction } from '@reduxjs/toolkit';
import {
  deleteWatercourseSuccess,
  editWatercourseSuccess,
  getLocationObjectFromWatercourse,
  postWatercourseSuccess,
} from '../../../watercourseSlice';
import { canShowSuccessHeader, setSuccessMessage } from '../../../mapSlice';
import i18n from '../../../../locales/i18n';
import { useLocation, useNavigate } from 'react-router';

export const postWatercourseLocation = createAction(`postWatercourseLocationSaga`);

export function* postWatercourseLocationSaga({ payload: data }) {
  let location = useLocation();
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

    yield put(
      setSuccessMessage([
        i18n.t('FARM_MAP.MAP_FILTER.WATERCOURSE'),
        i18n.t('message:MAP.SUCCESS_POST'),
      ]),
    );
    yield put(canShowSuccessHeader(true));
    history.push('/map');
  } catch (e) {
    history.push(location.pathname, {
      error: `${i18n.t('message:MAP.FAIL_POST')} ${i18n
        .t('FARM_MAP.MAP_FILTER.WATERCOURSE')
        .toLowerCase()}`,
    });
    console.log(e);
  }
}

export const editWatercourseLocation = createAction(`editWatercourseLocationSaga`);

export function* editWatercourseLocationSaga({ payload: data }) {
  let location = useLocation();
  const { formData, location_id, figure_id } = data;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromWatercourse({ ...formData, location_id, figure_id });

  try {
    const result = yield call(
      axios.put,
      `${locationURL}/${locationObject.figure.type}/${location_id}`,
      locationObject,
      header,
    );
    yield put(editWatercourseSuccess(result.data));

    yield put(
      setSuccessMessage([
        i18n.t('FARM_MAP.MAP_FILTER.WATERCOURSE'),
        i18n.t('message:MAP.SUCCESS_PATCH'),
      ]),
    );
    yield put(canShowSuccessHeader(true));
    history.push('/map');
  } catch (e) {
    history.push(location.pathname, {
      error: `${i18n.t('message:MAP.FAIL_PATCH')} ${i18n
        .t('FARM_MAP.MAP_FILTER.WATERCOURSE')
        .toLowerCase()}`,
    });
    console.log(e);
  }
}

export const deleteWatercourseLocation = createAction(`deleteWatercourseLocationSaga`);

export function* deleteWatercourseLocationSaga({ payload: data }) {
  let location = useLocation();
  const { location_id } = data;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.delete, `${locationURL}/${location_id}`, header);
    yield put(deleteWatercourseSuccess(location_id));
    yield put(
      setSuccessMessage([
        i18n.t('FARM_MAP.MAP_FILTER.WATERCOURSE'),
        i18n.t('message:MAP.SUCCESS_DELETE'),
      ]),
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

export default function* watercourseLocationSaga() {
  yield takeLeading(postWatercourseLocation.type, postWatercourseLocationSaga);
  yield takeLeading(editWatercourseLocation.type, editWatercourseLocationSaga);
  yield takeLeading(deleteWatercourseLocation.type, deleteWatercourseLocationSaga);
}
