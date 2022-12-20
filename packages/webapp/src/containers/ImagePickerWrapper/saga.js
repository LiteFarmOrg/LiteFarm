import { call, put, select, takeLeading } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';
import apiConfig from '../../apiConfig';
import { loginSelector } from '../userFarmSlice';
import { axios, getHeader } from '../saga';
import i18n from '../../locales/i18n';
import { enqueueErrorSnackbar } from '../Snackbar/snackbarSlice';

const { cropVarietyURL, cropURL } = apiConfig;
const imageRouteURL = {
  crop_variety: cropVarietyURL,
  crop: cropURL,
  //deprecated
  'storybook/': cropVarietyURL,
};

export const uploadImage = createAction(`uploadImageSaga`);

export function* uploadImageSaga({ payload: { file, onUploadSuccess, targetRoute } }) {
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  try {
    const imageRoute = imageRouteURL[targetRoute];
    const formData = new FormData();
    formData.append('_file_', file);
    const result = yield call(axios.post, `${imageRoute}/upload/farm/${farm_id}`, formData, header);
    if (result) {
      onUploadSuccess?.(result.data.url);
    } else {
      yield put(enqueueErrorSnackbar(i18n.t('message:ATTACHMENTS.ERROR.FAILED_UPLOAD')));
    }
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:ATTACHMENTS.ERROR.FAILED_UPLOAD')));
    console.log(e);
  }
}

export default function* imageUploaderSaga() {
  yield takeLeading(uploadImage.type, uploadImageSaga);
}
