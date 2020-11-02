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

export const addOrganicCertificateSurvey = (survey) => {
  return {
    type: ADD_ORGANIC_CERTIFIER_SURVEY,
    survey
  }
};

export const updateInterested = (interested) => {
  return {
    type: UPDATE_INTERESTED_IN_ORGANIC_CERTIFICATE_SURVEY,
    interested
  }
};

export const updateCertifiers = (certifiers) => {
  return {
    type: UPDATE_CERTIFIERS_IN_ORGANIC_CERTIFICATE_SURVEY,
    certifiers
  }
};

export const setCertifierSurvey = (survey) => {
  return {
    type: SET_ORGANIC_CERTIFIER_SURVEY_IN_STATE,
    survey
  }
};