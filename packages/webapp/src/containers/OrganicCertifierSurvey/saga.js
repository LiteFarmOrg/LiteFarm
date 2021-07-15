import {
  certifierSurveySelector,
  getCertificationSurveysSuccess,
  onLoadingCertifierSurveyFail,
  onLoadingCertifierSurveyStart,
  postOrganicCertifierSurveySuccess,
  putOrganicCertifierSurveySuccess,
} from './slice';
import { createAction } from '@reduxjs/toolkit';
import { call, put, select, takeLatest, takeLeading } from 'redux-saga/effects';
import { url, userFarmUrl } from '../../apiConfig';
import { loginSelector, patchStepFourSuccess, userFarmSelector } from '../userFarmSlice';
import { axios, getHeader } from '../saga';
import history from '../../history';
import { getCertificationsSuccess } from './certificationSlice';
import { getCertifiersSuccess } from './certifierSlice';
import { enqueueErrorSnackbar } from '../Snackbar/snackbarSlice';
import i18n from '../../locales/i18n';

const getSurveyUrl = (farm_id) => `${url}/organic_certifier_survey/${farm_id}`;
const postUrl = () => url + '/organic_certifier_survey';
const putUrl = () => url + '/organic_certifier_survey';
const patchStepUrl = (farm_id, user_id) =>
  `${userFarmUrl}/onboarding/farm/${farm_id}/user/${user_id}`;

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

export const postOrganicCertifierSurvey = createAction(`postOrganicCertifierSurveySaga`);

export function* postOrganicCertifierSurveySaga({ payload }) {
  try {
    const { user_id, farm_id } = yield select(loginSelector);
    const header = getHeader(user_id, farm_id);
    const { survey, callback } = payload;
    const surveyReqBody = { ...survey, farm_id };
    const result = yield call(axios.post, postUrl(), surveyReqBody, header);
    yield put(postOrganicCertifierSurveySuccess(result.data));

    const step = {
      step_four: true,
      step_four_end: new Date(),
    };
    yield call(axios.patch, patchStepUrl(farm_id, user_id), step, header);
    yield put(patchStepFourSuccess({ ...step, user_id, farm_id }));

    callback && callback();
  } catch (e) {
    console.log('failed to add certifiers');
    yield put(enqueueErrorSnackbar(i18n.t('message:ORGANIC_CERTIFIER_SURVEY.ERROR.CREATE')));
  }
}

export const putOrganicCertifierSurvey = createAction(`putOrganicCertifierSurveySaga`);

export function* putOrganicCertifierSurveySaga({ payload }) {
  try {
    const { user_id, farm_id, step_four } = yield select(userFarmSelector);
    const header = getHeader(user_id, farm_id);
    const { survey, callback } = payload;
    const surveyReqBody = { ...survey, farm_id };
    const result = yield call(axios.put, putUrl(), surveyReqBody, header);
    yield put(putOrganicCertifierSurveySuccess(result.data));
    if (!step_four) {
      const step = {
        step_four: true,
        step_four_end: new Date(),
      };
      yield call(axios.patch, patchStepUrl(farm_id, user_id), step, header);
      yield put(patchStepFourSuccess({ ...step, user_id, farm_id }));
    }
    callback && callback();
  } catch (e) {
    console.log('failed to add certifiers');
    yield put(enqueueErrorSnackbar(i18n.t('message:ORGANIC_CERTIFIER_SURVEY.ERROR.UPDATE')));
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

export default function* certifierSurveySaga() {
  yield takeLatest(getCertificationSurveys.type, getCertificationSurveysSaga);
  yield takeLeading(postOrganicCertifierSurvey.type, postOrganicCertifierSurveySaga);
  yield takeLeading(putOrganicCertifierSurvey.type, putOrganicCertifierSurveySaga);
  yield takeLatest(getAllSupportedCertifications.type, getAllSupportedCertificationsSaga);
  yield takeLatest(getAllSupportedCertifiers.type, getAllSupportedCertifiersSaga);
  yield takeLeading(patchStepFour.type, patchStepFourSaga);
}
