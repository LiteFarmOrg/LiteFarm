import { GET_FERTILIZERS, SET_FERTILIZERS, ADD_FERTILIZER, ADD_FERTILIZER_LOG, EDIT_FERTILIZER_LOG } from './constants';

export const getFertilizers = () => {
  return {
    type: GET_FERTILIZERS,
  }
};

export const setFertilizersInState = (fertilizers) => {
  return {
    type: SET_FERTILIZERS,
    fertilizers
  }
};

export const addFertilizer = (fertConfig) => {
  return {
    type: ADD_FERTILIZER,
    fertConfig
  }
};

export const addFertilizerLog = (fertConfig) => {
  return {
    type: ADD_FERTILIZER_LOG,
    fertConfig
  }
};

export const editFertilizerLog = (fertConfig) => {
  return {
    type: EDIT_FERTILIZER_LOG,
    fertConfig
  }
};
