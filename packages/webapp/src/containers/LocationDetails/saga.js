import { call, select, takeLatest } from 'redux-saga/effects';
import apiConfig from '../../apiConfig';
import { loginSelector } from '../userFarmSlice';
import { axios, getHeader } from '../saga';
import { createAction } from '@reduxjs/toolkit';

export const checkLocationDependencies = createAction(`checkLocationDependenciesSaga`);

export function* checkLocationDependenciesSaga({ payload: data }) {
  console.log('in saga for checking location dep');
  const { location_id, setShowConfirmRetireModal, setShowCannotRetireModal } = data;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, `${locationURL}/check_delete/${location_id}`, header);
    setShowConfirmRetireModal(true);
  } catch (e) {
    setShowCannotRetireModal(true);
  }
}

export default function* locationSaga() {
  yield takeLatest(checkLocationDependencies.type, checkLocationDependenciesSaga);
}
