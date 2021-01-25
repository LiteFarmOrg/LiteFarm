// actions
import {
  ADD_LOG,
  DELETE_LOG,
  EDIT_LOG,
  ADD_HARVEST_USE_TYPE,
} from './constants';
import { ADD_LOG, DELETE_LOG, EDIT_LOG } from './constants';

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

export const addHarvestUseType = (typeName) => {
  return {
    type: ADD_HARVEST_USE_TYPE,
    typeName,
  };
};
