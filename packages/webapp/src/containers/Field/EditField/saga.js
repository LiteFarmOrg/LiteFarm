import { createAction } from '@reduxjs/toolkit';
import { put, takeLatest, call, select } from 'redux-saga/effects';
import { fieldURL } from '../../../apiConfig';
import { loginSelector } from '../../userFarmSlice';
import { getHeader } from '../../saga';
import { putFieldSuccess } from '../../fieldSlice';
import { toastr } from 'react-redux-toastr';

const axios = require('axios');
const putUrl = (field_id) => `${fieldURL}/${field_id}`;

export const putField = createAction(`putFieldSaga`);

export function* putFieldSaga({ payload: field }) {
  try {
    let { user_id, farm_id } = yield select(loginSelector);
    const header = getHeader(user_id, farm_id);
    yield call(axios.put, putUrl(field.field_id), field, header);
    yield put(putFieldSuccess(field));
    toastr.success(this.props.t('message:FIELD.SUCCESS.UPDATE_NAME'));
  } catch (e) {
    toastr.error(this.props.t('message:FIELD.ERROR.UPDATE_NAME'));
  }
}

export default function* editFieldSaga() {
  yield takeLatest(putField.type, putFieldSaga);
}
