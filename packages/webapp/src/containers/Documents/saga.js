import { select, takeLeading } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';
import apiConfig from '../../apiConfig';
import { loginSelector } from '../userFarmSlice';
import { axios, getHeader } from '../saga';

export const postDocument = createAction(`postDocumentSaga`);

export function* postDocumentSaga({ payload: documentData }) {
  const { documentUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
}

export default function* managementPlanSaga() {
  yield takeLeading(postDocument.type, postDocumentSaga);
}
