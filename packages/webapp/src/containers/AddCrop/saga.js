import { call, put, select, takeLeading } from 'redux-saga/effects';
import apiConfig from '../../apiConfig';
import { loginSelector } from '../userFarmSlice';
import { toastr } from 'react-redux-toastr';
import { axios, getHeader } from '../saga';
import { createAction } from '@reduxjs/toolkit';
import { postCropVarietySuccess } from '../cropVarietySlice';
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
    toastr.success('Successfully saved varietal!');
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

export const postCropAndVarietal = createAction(`postCropAndVarietalSaga`);
export function* postCropAndVarietalSaga({ payload: { crop, variety } }) {
  const { cropURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  const varietyKeys = Object.keys(variety);
  let newCrop = Object.keys(crop).reduce((acc, curr) => {
    if (varietyKeys.includes(curr)) {
      return acc;
    }
    acc[curr] = crop[curr];
    return acc;
  }, {});
  newCrop.crop_group = newCrop.crop_group.value;
  const data = {
    crop: {
      ...newCrop,
      farm_id,
    },
    variety: {
      ...variety,
      farm_id,
    },
    farm_id,
  };
  try {
    const result = yield call(axios.post, `${cropURL}/crop_variety`, data, header);
    // yield put(postCropVarietySuccess(result.data));
    toastr.success('Successfully saved varietal!');
  } catch (e) {
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
  yield takeLeading(postCropAndVarietal.type, postCropAndVarietalSaga);
}
