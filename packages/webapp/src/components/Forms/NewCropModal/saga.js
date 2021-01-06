import { put, takeEvery, call, select } from 'redux-saga/effects';
import apiConfig from '../../../apiConfig';
import { loginSelector } from '../../../containers/userFarmSlice';
import { toastr } from 'react-redux-toastr';
import { getHeader } from '../../../containers/saga';
import { createAction } from '@reduxjs/toolkit';
import { postCropSuccess } from '../../../containers/cropSlice';
const axios = require('axios');
export const postCrop = createAction(`postCropSaga`);

export function* postCropSaga({ payload: crop }) {
  const { cropURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  const data = {
    crop_common_name: crop.crop_common_name,
    crop_genus: crop.crop_genus,
    crop_specie: crop.crop_specie,
    crop_group: crop.crop_group,
    crop_subgroup: crop.crop_subgroup,
    max_rooting_depth: crop.max_rooting_depth,
    depletion_fraction: crop.depletion_fraction,
    is_avg_depth: crop.is_avg_depth,
    initial_kc: crop.initial_kc,
    mid_kc: crop.mid_kc,
    end_kc: crop.end_kc,
    max_height: crop.max_height,
    is_avg_kc: crop.is_avg_kc,
    nutrient_notes: crop.nutrient_notes,
    nutrient_credits: crop.nutrient_credits,
    percentrefuse: crop.percentrefuse,
    refuse: crop.refuse,
    protein: crop.protein,
    lipid: crop.lipid,
    energy: crop.energy,
    ca: crop.ca,
    fe: crop.fe,
    mg: crop.mg,
    ph: crop.ph,
    k: crop.k,
    na: crop.na,
    zn: crop.zn,
    cu: crop.cu,
    fl: crop.fl,
    mn: crop.mn,
    se: crop.se,
    vita_rae: crop.vita_rae,
    vite: crop.vite,
    vitc: crop.vitc,
    thiamin: crop.thiamin,
    riboflavin: crop.riboflavin,
    niacin: crop.niacin,
    pantothenic: crop.pantothenic,
    vitb6: crop.vitb6,
    folate: crop.folate,
    vitb12: crop.vitb12,
    vitk: crop.vitk,
    is_avg_nutrient: crop.is_avg_nutrient,
    farm_id: farm_id,
    user_added: crop.user_added,
  };
  try {
    const result = yield call(axios.post, cropURL + '/', data, header);
    yield put(postCropSuccess(result.data));
    toastr.success('Successfully saved Crop!');
  } catch (e) {
    console.log('failed to add fieldCrop to database');
    toastr.error('failed to add fieldCrop to database');
  }
}

export default function* cropSaga() {
  yield takeEvery(postCrop.type, postCropSaga);
}
