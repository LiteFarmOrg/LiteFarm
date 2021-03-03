import { createAction } from '@reduxjs/toolkit';
import { call, select, takeLatest } from 'redux-saga/effects';
import { fieldURL } from '../../../apiConfig';
import { loginSelector } from '../../userFarmSlice';
import { axios, getHeader } from '../../saga';
import { toastr } from 'react-redux-toastr';
import i18n from '../../../locales/i18n';

const putUrl = (field_id) => `${fieldURL}/${field_id}`;

export const putField = createAction(`putFieldSaga`);

export function* putFieldSaga({ payload: field }) {
  try {
    let { user_id, farm_id } = yield select(loginSelector);
    const header = getHeader(user_id, farm_id);
    yield call(axios.put, putUrl(field.field_id), field, header);
    // yield put(putFieldSuccess(field));
    toastr.success(i18n.t('message:FIELD.SUCCESS.UPDATE_NAME'));
  } catch (e) {
    toastr.error(i18n.t('message:FIELD.ERROR.UPDATE_NAME'));
  }
}

export default function* editFieldSaga() {
  yield takeLatest(putField.type, putFieldSaga);
}
