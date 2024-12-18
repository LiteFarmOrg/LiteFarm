/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */

import { call, put, select, takeLeading } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';
import apiConfig from '../../apiConfig';
import { loginSelector } from '../userFarmSlice';
import { axios, getHeader, onReqSuccessSaga } from '../saga';
import i18n from '../../locales/i18n';
import { archiveDocumentSuccess, postDocumentSuccess, putDocumentSuccess } from '../documentSlice';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../Snackbar/snackbarSlice';
import { useNavigate } from 'react-router-dom';

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
    yield call(onReqSuccessSaga, {
      message: i18n.t('message:ATTACHMENTS.SUCCESS.CREATE'),
      pathname: '/documents',
    });
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:ATTACHMENTS.ERROR.CREATE')));
    console.log(e);
  }
}

export const archiveDocument = createAction(`archiveDocumentSaga`);

export function* archiveDocumentSaga({ payload: { document_id, archived } }) {
  let navigate = useNavigate();
  const { documentUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  const archivedStr = archived ? 'ARCHIVE' : 'UNARCHIVE';
  try {
    const result = yield call(
      axios.patch,
      `${documentUrl}/archive/${document_id}`,
      { archived },
      header,
    );
    if (result) {
      yield put(archiveDocumentSuccess(document_id));
      yield put(enqueueSuccessSnackbar(i18n.t(`message:ATTACHMENTS.SUCCESS.${archivedStr}`)));
      navigate(-1);
    } else {
      yield put(enqueueErrorSnackbar(i18n.t(`message:ATTACHMENTS.ERROR.FAILED_${archivedStr}`)));
      navigate(0);
    }
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t(`message:ATTACHMENTS.ERROR.FAILED_${archivedStr}`)));
    navigate(0);
    console.log(e);
  }
}

export const updateDocument = createAction(`updateDocumentSaga`);

export function* updateDocumentSaga({ payload: { document_id, documentData } }) {
  let navigate = useNavigate();
  const { documentUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(
      axios.put,
      `${documentUrl}/${document_id}`,
      { ...documentData, farm_id },
      header,
    );
    yield put(putDocumentSuccess(result.data));
    yield put(enqueueSuccessSnackbar(i18n.t('message:ATTACHMENTS.SUCCESS.UPDATE')));
    navigate('/documents');
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:ATTACHMENTS.ERROR.UPDATE')));
    console.log(e);
  }
}

export default function* documentSaga() {
  yield takeLeading(postDocument.type, postDocumentSaga);
  yield takeLeading(archiveDocument.type, archiveDocumentSaga);
  yield takeLeading(updateDocument.type, updateDocumentSaga);
}
