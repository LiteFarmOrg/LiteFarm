import {
  certifierSurveySelector,
  getCertifiersSuccess,
  onLoadingCertifierSurveyFail,
  onLoadingCertifierSurveyStart,
  patchCertifiersSuccess,
  patchInterestedSuccess,
  patchRequestedCertificationSuccess,
  patchRequestedCertifiersSuccess,
  postCertifiersSuccess,
} from './slice';
import { setcertificationTypes, setCertifiers } from './organicCertifierSurveySlice';
import { createAction } from '@reduxjs/toolkit';
import { call, put, select, takeLatest, takeLeading } from 'redux-saga/effects';
import { url, userFarmUrl } from '../../apiConfig';
import { loginSelector, patchStepFourSuccess } from '../userFarmSlice';
import { axios, getHeader } from '../saga';
import history from '../../history';

const getSurveyUrl = (farm_id) => `${url}/organic_certifier_survey/${farm_id}`;
const postUrl = () => url + '/organic_certifier_survey';
const patchCertifierUrl = (survey_id) => `${url}/organic_certifier_survey/${survey_id}/certifiers`;
const patchRequestedCertifierUrl = (survey_id) =>
  `${url}/organic_certifier_survey/${survey_id}/requested_certifier`;
const patchInterestedUrl = (survey_id) => `${url}/organic_certifier_survey/${survey_id}/interested`;
const patchRequestedCertificationUrl = (survey_id) =>
  `${url}/organic_certifier_survey/${survey_id}/requested_certification`;
const patchStepUrl = (farm_id, user_id) =>
  `${userFarmUrl}/onboarding/farm/${farm_id}/user/${user_id}`;

export const getCertifiers = createAction(`getCertifiersSaga`);
export function* getCertifiersSaga() {
  try {
    yield put(onLoadingCertifierSurveyStart());
    const { user_id, farm_id } = yield select(loginSelector);
    const header = getHeader(user_id, farm_id);
    const result = yield call(axios.get, getSurveyUrl(farm_id), header);
    yield put(getCertifiersSuccess(result.data));
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
    yield put(setcertificationTypes(result.data));
  } catch (e) {
    console.log('failed to get all certification types');
  }
}

export const getAllSupportedCertifiers = createAction(`getAllSupportedCertifiersSaga`);
export function* getAllSupportedCertifiersSaga({ payload }) {
  try {
    const { user_id, farm_id } = yield select(loginSelector);
    const header = getHeader(user_id, farm_id);
    const result = yield call(
      axios.get,
      `${url}/organic_certifier_survey/${farm_id}/supported_certifiers/${payload}`,
      header,
    );
    yield put(setCertifiers(result.data));
  } catch (e) {
    console.log('failed to get all certifier types');
  }
}

export const postCertifiers = createAction(`postCertifiersSaga`);

export function* postCertifiersSaga({ payload }) {
  try {
    const { user_id, farm_id } = yield select(loginSelector);
    const header = getHeader(user_id, farm_id);
    const { survey, callback } = payload;
    const surveyReqBody = { ...survey, farm_id };
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
    console.log('failed to add certifiers');
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
    console.log('failed to add certifiers');
  }
}

export const patchStepFour = createAction(`patchStepFourSaga`);

export function* patchStepFourSaga({ payload }) {
  const survey = yield select(certifierSurveySelector);
  try {
    const { user_id, farm_id } = yield select(loginSelector);
    const header = getHeader(user_id, farm_id);
    let step = {
      step_four: true,
      step_four_end: new Date(),
    };
    yield call(axios.patch, patchStepUrl(farm_id, user_id), step, header);
    yield put(patchStepFourSuccess({ ...step, user_id, farm_id }));
    history.push('/outro');

    // callback && callback();
  } catch (e) {
    console.log('failed to update step 4');
  }
}

export const patchRequestedCertifiers = createAction(`patchRequestedCertifiersSaga`);

export function* patchRequestedCertifiersSaga({ payload }) {
  const survey = yield select(certifierSurveySelector);
  try {
    const { user_id, farm_id } = yield select(loginSelector);
    const header = getHeader(user_id, farm_id);
    const { data, callback } = payload;
    const body = { ...survey, data };
    yield call(axios.patch, patchRequestedCertifierUrl(survey.survey_id), body, header);
    yield put(patchRequestedCertifiersSuccess({ data, farm_id }));
    callback && callback();
  } catch (e) {
    console.log('failed to add requested certifiers');
  }
}

export const patchRequestedCertification = createAction(`patchRequestedCertificationSaga`);

export function* patchRequestedCertificationSaga({ payload }) {
  const survey = yield select(certifierSurveySelector);
  try {
    const { user_id, farm_id } = yield select(loginSelector);
    const header = getHeader(user_id, farm_id);
    const { data, callback } = payload;
    const body = { ...survey, data };
    yield call(axios.patch, patchRequestedCertificationUrl(survey.survey_id), body, header);
    yield put(patchRequestedCertificationSuccess({ data, farm_id }));
    callback && callback();
  } catch (e) {
    console.log('failed to add requested certifications');
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
    console.log('failed to add certifiers');
  }
}

export default function* certifierSurveySaga() {
  yield takeLeading(patchInterested.type, patchInterestedSaga);
  yield takeLeading(patchCertifiers.type, patchCertifiersSaga);
  yield takeLatest(getCertifiers.type, getCertifiersSaga);
  yield takeLeading(postCertifiers.type, postCertifiersSaga);
  yield takeLatest(getAllSupportedCertifications.type, getAllSupportedCertificationsSaga);
  yield takeLatest(getAllSupportedCertifiers.type, getAllSupportedCertifiersSaga);
  yield takeLeading(patchRequestedCertifiers.type, patchRequestedCertifiersSaga);
  yield takeLeading(patchRequestedCertification.type, patchRequestedCertificationSaga);
  yield takeLeading(patchStepFour.type, patchStepFourSaga);
}
