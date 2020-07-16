// actions
import { ADD_LOG, EDIT_LOG, DELETE_LOG } from "./constants";

export const addLog = (formValue) => {
  return {
    type: ADD_LOG,
    formValue
  }
};

export const editLog = (formValue) => {
  return {
    type: EDIT_LOG,
    formValue
  }
};

export const deleteLog = (id) => {
  return {
    type: DELETE_LOG,
    id
  }
};
