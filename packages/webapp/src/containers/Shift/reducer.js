/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (reducer.js) is part of LiteFarm.
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
  SET_TASK_TYPES_IN_STATE, SET_SELECTED_TASKS, SET_SHIFT_DURATION, SET_START_END_SHIFT, SET_SHIFTS_IN_SHIFT, SET_SELECTED_SHIFT
} from './constants';

const initialState = {
  taskTypes: [],
  selectedTasks: [],
  availableDuration: 0,
  startEndObj: {},
  shifts: null,
  selectedShift: {}
};

function shiftReducer(state = initialState, action) {
  switch (action.type) {
    case SET_TASK_TYPES_IN_STATE:
      return Object.assign({}, state, {
        taskTypes: action.taskTypes,
      });
    case SET_SELECTED_TASKS:
      return Object.assign({}, state, {
        selectedTasks: action.selectedTasks,
      });
    case SET_SHIFT_DURATION:
      return Object.assign({}, state, {
        availableDuration: action.duration,
      });
    case SET_START_END_SHIFT:
      return Object.assign({}, state, {
        startEndObj: action.startEndObj,
      });
    case SET_SHIFTS_IN_SHIFT:
      return Object.assign({}, state, {
        shifts: action.shifts,
      });
    case SET_SELECTED_SHIFT:
      return Object.assign({}, state, {
        selectedShift: action.selectedShift,
      });
    default:
      return state
  }
}

export default shiftReducer;
