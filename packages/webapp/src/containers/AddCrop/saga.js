import { call, put, select, takeLeading } from 'redux-saga/effects';
import apiConfig from '../../apiConfig';
import { loginSelector } from '../../containers/userFarmSlice';
import { toastr } from 'react-redux-toastr';
import { axios, getHeader } from '../../containers/saga';
import { createAction } from '@reduxjs/toolkit';
import { postCropVarietySuccess } from '../../containers/cropVarietySlice';

export const postVarietal = createAction(`postVarietalSaga`);

export function* postVarietalSaga({ payload: varietal }) {
  const { cropVarietyURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  const data = {
    crop_id: varietal.crop_id,
    crop_variety_name: varietal.crop_variety_name,
    farm_id: farm_id,
    supplier: varietal.supplier,
    seeding_type: varietal.seeding_type,
    lifecycle: varietal.lifecycle,
    compliance_file_url: varietal.compliance_file_url,
    organic: varietal.organic,
    treated: varietal.treated,
    genetically_engineered: varietal.genetically_engineered,
    searched: varietal.searched,
  };

  try {
    const result = yield call(axios.post, cropVarietyURL + '/', data, header);
    yield put(postCropVarietySuccess(result.data));
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

export const postCropAndVarietal = createAction(`postCropAndVarietalSaga`);
export function* postCropAndVarietalSaga({ payload: { crop, varietal } }) {
  // const { cropVarietyURL } = apiConfig;
  // let { user_id, farm_id } = yield select(loginSelector);
  // const header = getHeader(user_id, farm_id);
  // const data = {
  //   crop_id: varietal.crop_id,
  //   crop_variety_name: varietal.crop_variety_name,
  //   farm_id: farm_id,
  //   supplier: varietal.supplier,
  //   seeding_type: varietal.seeding_type,
  //   lifecycle: varietal.lifecycle,
  //   compliance_file_url: varietal.compliance_file_url,
  //   organic: varietal.organic,
  //   treated: varietal.treated,
  //   genetically_engineered: varietal.genetically_engineered,
  //   searched: varietal.searched,
  // };
  // try {
  //   const result = yield call(axios.post, cropVarietyURL + '/', data, header);
  //   yield put(postCropVarietySuccess(result.data));
  //   toastr.success('Successfully saved varietal!');
  // } catch (e) {
  //   if (e.response.data.violationError) {
  //     toastr.error('Error: Varietal exists');
  //     console.log('failed to add varietal to database');
  //   } else {
  //     console.log('failed to add varietal to database');
  //     toastr.error('Error: failed to add varietal to database');
  //   }
  // }
}

export default function* varietalSaga() {
  yield takeLeading(postVarietal.type, postVarietalSaga);
  yield takeLeading(postCropAndVarietal.type, postCropAndVarietalSaga);
}
