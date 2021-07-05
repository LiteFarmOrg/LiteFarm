import history from '../../history';
import { all, call, put, select, takeLeading } from 'redux-saga/effects';
import { url } from '../../apiConfig';
import { loginSelector } from '../userFarmSlice';
import { axios, getHeader } from '../saga';
import { createAction } from '@reduxjs/toolkit';
import i18n from '../../locales/i18n';

const exportUrl = () => `${url}/temporary_route_to_be_replaced`; //TODO: REPLACE ROUTE

export const exportCertificationData = createAction('exportCertificationDataSaga');
export function* exportCertificationDataSaga({ payload: exportData }) {
  try {
    const { user_id, farm_id } = yield select(loginSelector);
    const header = getHeader(user_id);

    const postData = {
      farm_id,
      ...exportData,
    };
    const result = yield call(axios.post, exportUrl(), postData, header);
    history.push('/');
  } catch (error) {
    console.log('failed to submit reporting period', error);
  }
}

export default function* certificationsSaga() {
  yield takeLeading(exportCertificationData.type, exportCertificationDataSaga);
}
