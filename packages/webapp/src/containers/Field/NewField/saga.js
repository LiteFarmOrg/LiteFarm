import { createAction } from '@reduxjs/toolkit';
import { put, takeLatest, call, select } from 'redux-saga/effects';
import { fieldURL } from '../../../apiConfig';
import { loginSelector } from '../../userFarmSlice';
import { getHeader } from '../../saga';
import { postFieldSuccess } from '../../fieldSlice';
import history from '../../../history';
const axios = require('axios');
const postUrl = () => fieldURL;


export const postField = createAction(`postFieldSaga`);

export function* postFieldSaga({ payload }) {
  try {
    const { user_id, farm_id } = yield select(loginSelector);
    const header = getHeader(user_id, farm_id);
    const { field_name, grid_points, area } = payload;
    const fieldReqBody = { field_name, grid_points, area , farm_id }
    const result = yield call(axios.post, postUrl(), fieldReqBody, header);
    yield put(postFieldSuccess(result.data));
    history.push('/field');
  } catch (e) {
    console.log('failed to add certifiers')
  }
}

export default function* newFieldSaga() {
  yield takeLatest(postField.type, postFieldSaga);
}
