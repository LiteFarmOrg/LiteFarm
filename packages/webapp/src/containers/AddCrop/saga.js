import { call, put, select, takeLeading } from 'redux-saga/effects';
import apiConfig from '../../apiConfig';
import { loginSelector } from '../../containers/userFarmSlice';
import { toastr } from 'react-redux-toastr';
import { axios, getHeader } from '../../containers/saga';
import { createAction } from '@reduxjs/toolkit';
import { postCropVarietySuccess } from '../../containers/cropVarietySlice';
import history from '../../history';

export const postVarietal = createAction(`postVarietalSaga`);

export function* postVarietalSaga({ payload: varietal }) {
  const { cropVarietyURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.post, cropVarietyURL + '/', { ...varietal, farm_id }, header);
    yield put(postCropVarietySuccess(result.data));
    history.push(`/crop_catalogue`);
  } catch (e) {
    //TODO remove toastr messages
    if (e.response.data.violationError) {
      toastr.error('Error: Varietal exists');
      console.log('failed to add varietal to database');
    } else {
      console.log('failed to add varietal to database');
      toastr.error('Error: failed to add varietal to database');
    }
  }
}

export default function* varietalSaga() {
  yield takeLeading(postVarietal.type, postVarietalSaga);
}
