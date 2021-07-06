import { call, select, takeLeading } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';
import apiConfig from '../../apiConfig';
import { loginSelector } from '../userFarmSlice';
import { axios, getHeader } from '../saga';
import { toastr } from 'react-redux-toastr';
import i18n from '../../locales/i18n';

export const uploadCropVarietyImage = createAction(`uploadCropVarietyImageSaga`);

export function* uploadCropVarietyImageSaga({ payload: { file, onUploadSuccess } }) {
  const { cropVarietyURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  try {
    const formData = new FormData();
    formData.append('_file_', file);
    const result = yield call(
      axios.post,
      `${cropVarietyURL}/upload/farm/${farm_id}`,
      formData,
      header,
    );
    if (result) {
      onUploadSuccess?.(result.data.url);
    } else {
      toastr.error(i18n.t('message:ATTACHMENTS.ERROR.FAILED_UPLOAD'));
    }
  } catch (e) {
    toastr.error(i18n.t('message:ATTACHMENTS.ERROR.FAILED_UPLOAD'));
    console.log(e);
  }
}

export default function* cropVarietyImageUploaderSaga() {
  yield takeLeading(uploadCropVarietyImage.type, uploadCropVarietyImageSaga);
}
