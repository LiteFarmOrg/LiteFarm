import { call, put, select, takeLeading } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';
import apiConfig from '../../../apiConfig';
import { loginSelector } from '../../userFarmSlice';
import { axios, getHeader } from '../../saga';
import { toastr } from 'react-redux-toastr';
import i18n from '../../../locales/i18n';
import { uploadFileSuccess } from '../../hooks/useHookFormPersist/hookFormPersistSlice';

export const uploadDocument = createAction(`uploadDocumentSaga`);

export function* uploadDocumentSaga({ payload }) {
  const { documentUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  try {
    const formData = new FormData();
    formData.append('_file_', payload.file);
    const result = yield call(
      axios.post,
      `${documentUrl}/upload/farm/${farm_id}`,
      formData,
      header,
    );
    if (result) {
      yield put(uploadFileSuccess(result.data));
      payload.onUploadEnd?.();
    } else {
      toastr.error(i18n.t('message:ATTACHMENTS.ERROR.FAILED_UPLOAD'));
    }
  } catch (e) {
    toastr.error(i18n.t('message:ATTACHMENTS.ERROR.FAILED_UPLOAD'));
    console.log(e);
  }
}

export default function* managementPlanSaga() {
  yield takeLeading(uploadDocument.type, uploadDocumentSaga);
}
