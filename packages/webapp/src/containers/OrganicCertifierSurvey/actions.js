import {
  ADD_ORGANIC_CERTIFIER_SURVEY,
  UPDATE_INTERESTED_IN_ORGANIC_CERTIFICATE_SURVEY,
  GET_ORGANIC_CERTIFIER_SURVEY,
  UPDATE_CERTIFIERS_IN_ORGANIC_CERTIFICATE_SURVEY,
  SET_ORGANIC_CERTIFIER_SURVEY_IN_STATE,
} from './constants';

export const getOrganicCertifierSurvey = () => {
  return {
    type: GET_ORGANIC_CERTIFIER_SURVEY
  }
};

export const addCertifierSurvey = (survey, callback) => {
  return {
    type: ADD_ORGANIC_CERTIFIER_SURVEY,
    survey,
    callback
  }
};

export const updateInterested = (interested, callback) => {
  return {
    type: UPDATE_INTERESTED_IN_ORGANIC_CERTIFICATE_SURVEY,
    interested,
    callback,
  }
};

export const updateCertifiers = (certifiers, callback) => {
  return {
    type: UPDATE_CERTIFIERS_IN_ORGANIC_CERTIFICATE_SURVEY,
    certifiers,
    callback
  }
};

export const setCertifierSurvey = (survey, callback) => {
  return {
    type: SET_ORGANIC_CERTIFIER_SURVEY_IN_STATE,
    survey,
    callback
  }
};