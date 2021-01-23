// actions
import {
  ADD_LOG,
  DELETE_LOG,
  EDIT_LOG,
  GET_HARVEST_USE_TYPES,
  ADD_HARVEST_USE_TYPE,
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

export const setSelectedUseTypes = (selectedUses) => {
  return {
    type: SET_SELECTED_USE_TYPES,
    selectedUses,
  };
};

export const addHarvestUseType = (typeName) => {
  return {
    type: ADD_HARVEST_USE_TYPE,
    typeName,
  };
};
