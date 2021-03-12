import { call, select, takeEvery } from 'redux-saga/effects';
import apiConfig from '../../../apiConfig';
import { loginSelector } from '../../../containers/userFarmSlice';
import { toastr } from 'react-redux-toastr';
import { getHeader } from '../../../containers/saga';
import { createAction } from '@reduxjs/toolkit';
import { getLocationObjectFromField, postFieldSuccess } from '../../fieldSlice';

const axios = require('axios');
export const postFieldLocation = createAction(`postFieldLocationSaga`);

export function* postFieldLocationSaga({ payload: data }) {
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  data.formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromField(data.formData);

  try {
    const result = yield call(
      axios.post,
      locationURL + '/' + `${locationObject.figure.type}`,
      locationObject,
      header,
    );
    console.log(result);
    postFieldSuccess(result.data);
  } catch (e) {
    console.log(e);
    // if (e.response.data.violationError) {
    //   toastr.error(i18n.t('message:NEW_FIELD_CROP.ERROR.VARIETY_EXISTS'));
    //   console.log('failed to add dataCrop to database');
    // } else {
    //   console.log('failed to add fieldCrop to database');
    //   toastr.error(i18n.t('message:NEW_FIELD_CROP.ERROR.GENERAL'));
    // }
  }
}

export default function* fieldLocationSaga() {
  yield takeEvery(postFieldLocation.type, postFieldLocationSaga);
}
