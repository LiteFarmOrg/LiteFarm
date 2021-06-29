import { call, put, select, takeLeading } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';
import apiConfig from '../../apiConfig';
import { loginSelector } from '../userFarmSlice';
import { axios, getHeader } from '../saga';
import { toastr } from 'react-redux-toastr';
import i18n from '../../locales/i18n';
import { archiveDocumentSuccess, postDocumentSuccess, putDocumentSuccess } from '../documentSlice';
import history from '../../history';

export const postDocument = createAction(`postDocumentSaga`);

export function* postDocumentSaga({ payload: documentData }) {
  const { documentUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(
      axios.post,
      `${documentUrl}/farm/${farm_id}`,
      { ...documentData, farm_id },
      header,
    );
    yield put(postDocumentSuccess(result.data));
    toastr.success(i18n.t('message:ATTACHMENTS.SUCCESS.CREATE'));
    history.push('/documents');
  } catch (e) {
    toastr.error(i18n.t('message:ATTACHMENTS.ERROR.CREATE'));
    console.log(e);
  }
}

export const archiveDocument = createAction(`archiveDocumentSaga`);

export function* archiveDocumentSaga({ payload: document_id }) {
  const { documentUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(axios.patch, `${documentUrl}/archive/${document_id}`, {}, header);
    if (result) {
      yield put(archiveDocumentSuccess(document_id));
      toastr.success(i18n.t('message:ATTACHMENTS.SUCCESS.ARCHIVE'));
      history.push('/documents');
    } else {
      toastr.error(i18n.t('message:ATTACHMENTS.ERROR.FAILED_ARCHIVE'));
    }
  } catch (e) {
    toastr.error(i18n.t('message:ATTACHMENTS.ERROR.FAILED_ARCHIVE'));
    console.log(e);
  }
}

export const updateDocument = createAction(`updateDocumentSaga`);

export function* updateDocumentSaga({ payload: {document_id, documentData} }) {
  const { documentUrl } = apiConfig;
  let {user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(
      axios.put,
      `${documentUrl}/${document_id}`,
      { ...documentData, farm_id },
      header,
    );
    yield put(putDocumentSuccess(result.data));
    toastr.success(i18n.t('message:ATTACHMENTS.SUCCESS.UPDATE'));
    history.push('/documents');
  } catch (e) {
    toastr.error(i18n.t('message:ATTACHMENTS.ERROR.UPDATE'));
    console.log(e);
  }
}

export default function* documentSaga() {
  yield takeLeading(postDocument.type, postDocumentSaga);
  yield takeLeading(archiveDocument.type, archiveDocumentSaga);
  yield takeLeading(updateDocument.type, updateDocumentSaga);
}
