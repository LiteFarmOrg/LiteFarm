import {
  ADD_ORGANIC_CERTIFIER_SURVEY,
  GET_ORGANIC_CERTIFIER_SURVEY,
  UPDATE_CERTIFIERS_IN_ORGANIC_CERTIFICATE_SURVEY,
  UPDATE_INTERESTED_IN_ORGANIC_CERTIFICATE_SURVEY,
} from './constants';
import { setCertifierSurvey } from './actions';
import { farmSelector } from '../selector';
import { certifierSurveySelector } from './selector';
import { put, takeLatest, call, select } from 'redux-saga/effects';
import { url } from '../../apiConfig';
import { userFarmUrl } from '../../apiConfig';
import { setFarmInState } from '../actions';

const axios = require('axios');
const getUrl = farm_id => `${url}/farm/${farm_id}/organic_certifier_survey`;
const postUrl = () => url + '/organic_certifier_survey';
const patchCertifierUrl = survey_id => `${url}/organic_certifier_survey/${survey_id}/certifiers`;
const patchInterestedUrl = survey_id => `${url}/organic_certifier_survey/${survey_id}/interested`;
const patchStepUrl = (farm_id, user_id) => `${userFarmUrl}/onboarding/farm/${farm_id}/user/${user_id}`;

export function* getOrganicCertifierSurvey() {
  try {
    const { user_id, farm_id } = yield select(farmSelector);
    const header = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
        user_id,
        farm_id,
      },
    };
    const result = yield call(axios.get, getUrl(farm_id), header);
    if (result.data) {
      yield put(setCertifierSurvey(result.data));
    }
  } catch (e) {
    console.log('failed to fetch certifiers from database')
  }
}

export function* addCertifierSurvey(payload) {
  try {
    const farm = yield select(farmSelector);
    const { user_id, farm_id } = farm;
    const header = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
        user_id,
        farm_id,
      },
    };
    const {survey, callback} = payload;
    const surveyReqBody = { ...survey, farm_id }
    // only non-deleted users
    const result = yield call(axios.post, postUrl(), surveyReqBody, header);
    yield put(setCertifierSurvey(result.data));
    if(!survey?.interested){
      let step = {
        step_four: true,
        step_four_end: new Date(),
      };
      yield call(axios.patch, patchStepUrl(farm_id, user_id), step, header);
      yield put(setFarmInState(step));
    }
    callback && callback();
  } catch (e) {
    console.log('failed to add certifiers')
  }
}

export function* updateCertifiers(payload) {
  const survey = yield select(certifierSurveySelector);
  try {
    const { user_id, farm_id } = yield select(farmSelector);
    const header = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
        user_id,
        farm_id,
      },
    };

    const { certifiers, callback } = payload;
    const body = { ...survey, certifiers };

    yield call(axios.patch, patchCertifierUrl(survey.survey_id), body, header);
    yield put(setCertifierSurvey(body));
    if(!payload.survey?.interested || payload.certifiers){
      let step = {
        step_four: true,
        step_four_end: new Date(),
      };
      yield call(axios.patch, patchStepUrl(farm_id, user_id), step, header);
      yield put(setFarmInState(step));
    }
    callback && callback();
  } catch (e) {
    console.log('failed to add certifiers')
  }
}

export function* updateInterested(payload) {
  const survey = yield select(certifierSurveySelector);
  try {
    const { user_id, farm_id } = yield select(farmSelector);
    const header = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
        user_id,
        farm_id,
      },
    };

    const { interested, callback } = payload;
    const body = { ...survey, interested };
    yield call(axios.patch, patchInterestedUrl(survey.survey_id), body, header);
    yield put(setCertifierSurvey(body));
    if(!interested){
      let step = {
        step_four: true,
        step_four_end: new Date(),
      };
      yield call(axios.patch, patchStepUrl(farm_id, user_id), step, header);
      yield put(setFarmInState(step));
    }
    callback && callback();
  } catch (e) {
    console.log('failed to add certifiers')
  }
}

export default function* certifierSurveySaga() {
  yield takeLatest(UPDATE_INTERESTED_IN_ORGANIC_CERTIFICATE_SURVEY, updateInterested);
  yield takeLatest(UPDATE_CERTIFIERS_IN_ORGANIC_CERTIFICATE_SURVEY, updateCertifiers);
  yield takeLatest(GET_ORGANIC_CERTIFIER_SURVEY, getOrganicCertifierSurvey);
  yield takeLatest(ADD_ORGANIC_CERTIFIER_SURVEY, addCertifierSurvey);
}
