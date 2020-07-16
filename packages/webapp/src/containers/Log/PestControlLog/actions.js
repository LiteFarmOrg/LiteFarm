import { GET_DISEASES, SET_DISEASES, ADD_DISEASES, ADD_PEST_CONTROL_LOG, GET_PESTICIDES, SET_PESTICIDES, ADD_PESTICIDES, EDIT_PEST_CONTROL_LOG } from './constants';

export const getDiseases = () => {
  return {
    type: GET_DISEASES,
  }
};

export const setDiseaseInState = (diseases) => {
  return {
    type: SET_DISEASES,
    diseases
  }
};

export const addDiseases = (diseaseConfig) => {
  return {
    type: ADD_DISEASES,
    diseaseConfig
  }
};

export const getPesticides = () => {
  return {
    type: GET_PESTICIDES,
  }
};

export const setPesticideInState = (pesticides) => {
  return {
    type: SET_PESTICIDES,
    pesticides
  }
};

export const addPesticide = (pesticideConfig) => {
  return {
    type: ADD_PESTICIDES,
    pesticideConfig
  }
};

export const addPestControlLog = (pcConfig) => {
  return {
    type: ADD_PEST_CONTROL_LOG,
    pcConfig
  }
};

export const editPestControlLog = (pcConfig) => {
  return {
    type: EDIT_PEST_CONTROL_LOG,
    pcConfig
  }
};

