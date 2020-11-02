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
import { toastr } from 'react-redux-toastr';
import {url} from '../../apiConfig';
const axios = require('axios');
const getUrl = farm_id => `${url}/farm/${farm_id}/organic_certifier_survey`;
const postUrl = () =>  url +'/organic_certifier_survey';
const patchCertifierUrl = survey_id => `${url}/organic_certifier_survey/${survey_id}/certifiers`;
const patchInterestedUrl = survey_id => `${url}/organic_certifier_survey/${survey_id}/interested`;

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
    const { user_id, farm_id } = yield select(farmSelector);
    const header = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
        user_id,
        farm_id,
      },
    };
    const survey = { ...payload.survey, farm_id }
    // only non-deleted users
    const result = yield call(axios.post, postUrl(), survey, header);
    if (result.data) {
      yield put(setCertifierSurvey(result.data));
    }
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

    const { certifiers } = payload;
    const body = {...survey, certifiers};
    setCertifierSurvey(body);
    yield call(axios.patch, patchCertifierUrl(survey.survey_id), body, header);
  } catch (e) {
    setCertifierSurvey(survey);
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

    const { interested } = payload;
    const body = {...survey, interested};
    setCertifierSurvey(body);
    yield call(axios.patch, patchInterestedUrl(survey.survey_id), body, header);
  } catch (e) {
    setCertifierSurvey(survey);
    console.log('failed to add certifiers')
  }
}

export default function* certifierSurveySaga() {
  yield takeLatest(UPDATE_INTERESTED_IN_ORGANIC_CERTIFICATE_SURVEY, updateInterested);
  yield takeLatest(UPDATE_CERTIFIERS_IN_ORGANIC_CERTIFICATE_SURVEY, updateCertifiers);
  yield takeLatest(GET_ORGANIC_CERTIFIER_SURVEY, getOrganicCertifierSurvey);
  yield takeLatest(ADD_ORGANIC_CERTIFIER_SURVEY, addCertifierSurvey);
}
