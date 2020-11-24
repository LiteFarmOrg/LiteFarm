import {
  getCertifiersSuccess,
  postCertifiersSuccess,
  patchCertifiersSuccess,
  patchInterestedSuccess,
  certifierSurveySelector,
  onLoadingCertifierSurveyFail,
  onLoadingCertifierSurveyStart,
} from './slice';
import { createAction } from '@reduxjs/toolkit';
import { put, takeLatest, call, select } from 'redux-saga/effects';
import { url } from '../../apiConfig';
import { userFarmUrl } from '../../apiConfig';
import { loginSelector } from '../userFarmSlice';
import { patchStepFourSuccess } from '../userFarmSlice';
import { getHeader } from '../saga';

const axios = require('axios');
const getUrl = farm_id => `${url}/farm/${farm_id}/organic_certifier_survey`;
const postUrl = () => url + '/organic_certifier_survey';
const patchCertifierUrl = survey_id => `${url}/organic_certifier_survey/${survey_id}/certifiers`;
const patchInterestedUrl = survey_id => `${url}/organic_certifier_survey/${survey_id}/interested`;
const patchStepUrl = (farm_id, user_id) => `${userFarmUrl}/onboarding/farm/${farm_id}/user/${user_id}`;

export const getCertifiers = createAction(`getCertifiersSaga`);
export function* getCertifiersSaga() {
  try {
    yield put(onLoadingCertifierSurveyStart());
    const { user_id, farm_id } = yield select(loginSelector);
    const header = getHeader(user_id, farm_id);
    const result = yield call(axios.get, getUrl(farm_id), header);
    yield put(getCertifiersSuccess(result.data));
  } catch (e) {
    yield put(onLoadingCertifierSurveyFail());
    console.log('failed to fetch certifiers from database')
  }
}

export const postCertifiers = createAction(`postCertifiersSaga`);

export function* postCertifiersSaga({ payload }) {
  try {
    const { user_id, farm_id } = yield select(loginSelector);
    const header = getHeader(user_id, farm_id);
    const { survey, callback } = payload;
    const surveyReqBody = { ...survey, farm_id }
    // only non-deleted users
    const result = yield call(axios.post, postUrl(), surveyReqBody, header);
    yield put(postCertifiersSuccess(result.data));
    if (!survey?.interested) {
      let step = {
        step_four: true,
        step_four_end: new Date(),
      };
      yield call(axios.patch, patchStepUrl(farm_id, user_id), step, header);
      yield put(patchStepFourSuccess({ ...step, user_id, farm_id }));
    }
    callback && callback();
  } catch (e) {
    console.log('failed to add certifiers')
  }
}

export const patchCertifiers = createAction(`patchCertifiersSaga`);

export function* patchCertifiersSaga({ payload }) {
  const survey = yield select(certifierSurveySelector);
  try {
    const { user_id, farm_id } = yield select(loginSelector);
    const header = getHeader(user_id, farm_id);
    const { certifiers, callback } = payload;
    const body = { ...survey, certifiers };
    yield call(axios.patch, patchCertifierUrl(survey.survey_id), body, header);
    yield put(patchCertifiersSuccess({ certifiers, farm_id }));
    if (!payload.survey?.interested || payload.certifiers) {
      let step = {
        step_four: true,
        step_four_end: new Date(),
      };
      yield call(axios.patch, patchStepUrl(farm_id, user_id), step, header);
      yield put(patchStepFourSuccess({ ...step, user_id, farm_id }));
    }
    callback && callback();
  } catch (e) {
    console.log('failed to add certifiers')
  }
}

export const patchInterested = createAction(`patchInterestedSaga`);

export function* patchInterestedSaga({ payload }) {
  const survey = yield select(certifierSurveySelector);
  try {
    const { user_id, farm_id } = yield select(loginSelector);
    const header = getHeader(user_id, farm_id);
    const { interested, callback } = payload;
    const body = { ...survey, interested };
    yield call(axios.patch, patchInterestedUrl(survey.survey_id), body, header);
    yield put(patchInterestedSuccess({ interested, farm_id }));
    if (!interested) {
      let step = {
        step_four: true,
        step_four_end: new Date(),
      };
      yield call(axios.patch, patchStepUrl(farm_id, user_id), step, header);
      yield put(patchStepFourSuccess({ ...step, user_id, farm_id }));
    }
    callback && callback();
  } catch (e) {
    console.log('failed to add certifiers')
  }
}


export default function* certifierSurveySaga() {
  yield takeLatest(patchInterested.type, patchInterestedSaga);
  yield takeLatest(patchCertifiers.type, patchCertifiersSaga);
  yield takeLatest(getCertifiers.type, getCertifiersSaga);
  yield takeLatest(postCertifiers.type, postCertifiersSaga);
}
