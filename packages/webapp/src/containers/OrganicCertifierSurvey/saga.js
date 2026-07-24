import {
  getCertificationSurveysSuccess,
  onLoadingCertifierSurveyFail,
  onLoadingCertifierSurveyStart,
} from './slice';
import { createAction } from '@reduxjs/toolkit';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { url } from '../../apiConfig';
import { loginSelector } from '../userFarmSlice';
import { axios, getHeader } from '../saga';
import { getCertificationsSuccess } from './certificationSlice';
import { getCertifiersSuccess } from './certifierSlice';

const getSurveyUrl = (farm_id) => `${url}/organic_certifier_survey/${farm_id}`;

export const getCertificationSurveys = createAction(`getCertificationSurveysSaga`);

export function* getCertificationSurveysSaga() {
  try {
    yield put(onLoadingCertifierSurveyStart());
    const { user_id, farm_id } = yield select(loginSelector);
    const header = getHeader(user_id, farm_id);
    const result = yield call(axios.get, getSurveyUrl(farm_id), header);
    yield put(getCertificationSurveysSuccess(result.data));
  } catch (e) {
    yield put(onLoadingCertifierSurveyFail(e));
    console.log('failed to fetch certifiers from database');
  }
}

export const getAllSupportedCertifications = createAction(`getAllSupportedCertificationsSaga`);

export function* getAllSupportedCertificationsSaga() {
  try {
    const { user_id, farm_id } = yield select(loginSelector);
    const header = getHeader(user_id, farm_id);
    const result = yield call(
      axios.get,
      `${url}/organic_certifier_survey/${farm_id}/supported_certifications`,
      header,
    );
    yield put(getCertificationsSuccess(result.data));
  } catch (e) {
    console.log('failed to get all certification types');
  }
}

export const getAllSupportedCertifiers = createAction(`getAllSupportedCertifiersSaga`);

export function* getAllSupportedCertifiersSaga() {
  try {
    const { user_id, farm_id } = yield select(loginSelector);
    const header = getHeader(user_id, farm_id);
    const result = yield call(
      axios.get,
      `${url}/organic_certifier_survey/${farm_id}/supported_certifiers`,
      header,
    );
    yield put(getCertifiersSuccess(result.data));
  } catch (e) {
    console.log('failed to get all certifier types');
  }
}

export default function* certifierSurveySaga() {
  yield takeLatest(getCertificationSurveys.type, getCertificationSurveysSaga);
  yield takeLatest(getAllSupportedCertifications.type, getAllSupportedCertificationsSaga);
  yield takeLatest(getAllSupportedCertifiers.type, getAllSupportedCertifiersSaga);
}
