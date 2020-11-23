/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (actions.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import {
  ADD_TASK_TYPE,
  DELETE_SHIFT,
  GET_ALL_SHIFT,
  GET_SHIFTS,
  GET_TASK_TYPES,
  SET_SELECTED_SHIFT,
  SET_SELECTED_TASKS,
  SET_SHIFT_DURATION,
  SET_SHIFTS_IN_SHIFT,
  SET_START_END_SHIFT,
  SET_TASK_TYPES_IN_STATE,
  SUBMIT_MULTI_SHIFT,
  SUBMIT_SHIFT,
  UPDATE_SHIFT,
} from './constants';


export const getShifts = () => {
  return {
    type: GET_SHIFTS,
  }
};

export const getAllShifts = () => {
  return {
    type: GET_ALL_SHIFT,
  }
};

export const setShifts = (shifts) => {
  return {
    type: SET_SHIFTS_IN_SHIFT,
    shifts
  }
};

export const submitShift = (shiftObj) => {
  return {
    type: SUBMIT_SHIFT,
    shiftObj
  }
};

export const submitMultiShift = (shiftObj) => {
  return {
    type: SUBMIT_MULTI_SHIFT,
    shiftObj
  }
};

export const updateShift = (shiftObj, shiftID) => {
  return {
    type: UPDATE_SHIFT,
    shiftObj,
    shiftID
  }
};

export const getTaskTypes = () => {
  return {
    type: GET_TASK_TYPES,
  }
};

export const addTaskType = (taskName) => {
  return {
    type: ADD_TASK_TYPE,
    taskName
  }
};

export const setTaskTypesInState = (taskTypes) => {
  return {
    type: SET_TASK_TYPES_IN_STATE,
    taskTypes
  }
};

export const setSelectedTasks = (selectedTasks) => {
  return {
    type: SET_SELECTED_TASKS,
    selectedTasks
  }
};

export const setShiftDuration = (duration) => {
  return {
    type: SET_SHIFT_DURATION,
    duration
  }
};

export const setStartEndInState = (startEndObj) => {
  return{
    type: SET_START_END_SHIFT,
    startEndObj
  }
};

export const setSelectedShift = (selectedShift) => {
  return {
    type: SET_SELECTED_SHIFT,
    selectedShift
  }
};

export const deleteShift = (shiftId) => {
  return {
    type: DELETE_SHIFT,
    shiftId
  }
};
