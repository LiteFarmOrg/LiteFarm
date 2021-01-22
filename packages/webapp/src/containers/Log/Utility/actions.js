// actions
import {
  ADD_LOG,
  DELETE_LOG,
  EDIT_LOG,
  GET_HARVEST_USE_TYPES,
  SET_SELECTED_USE_TYPES,
} from './constants';

export const addLog = (formValue) => {
  return {
    type: ADD_LOG,
    formValue,
  };
};

export const editLog = (formValue) => {
  return {
    type: EDIT_LOG,
    formValue,
  };
};

export const deleteLog = (id) => {
  return {
    type: DELETE_LOG,
    id,
  };
};

export const getHarvestUseTypes = (formValue) => {
  return {
    type: GET_HARVEST_USE_TYPES,
    formValue,
  };
};

export const setSelectedUseTypes = (selectedUseTypes) => {
  return {
    type: SET_SELECTED_USE_TYPES,
    selectedUseTypes,
  };
};
