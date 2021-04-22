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
  RESET_SHIFT_FILTER,
  SET_SELECTED_SHIFT,
  SET_SELECTED_TASKS,
  SET_SHIFT_DURATION,
  SET_SHIFT_END_DATE,
  SET_SHIFT_START_DATE,
  SET_SHIFT_TYPE,
  SET_SHIFTS_IN_SHIFT,
  SET_TASK_TYPES_IN_STATE,
} from './constants';

import moment from 'moment';

const initialState = {
  taskTypes: [],
  selectedTasks: [],
  availableDuration: 0,
  shifts: null,
  selectedShift: {},
  shiftType: undefined,
  fieldFilter: undefined,
  cropFilter: undefined,
  startDate: moment().startOf('year'),
  endDate: moment().endOf('year'),
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
    case SET_SHIFT_START_DATE:
      return Object.assign({}, state, {
        startDate: action.startDate,
      });
    case SET_SHIFT_END_DATE:
      return Object.assign({}, state, {
        endDate: action.endDate,
      });
    case SET_SHIFTS_IN_SHIFT:
      return Object.assign({}, state, {
        shifts: action.shifts,
      });
    case SET_SELECTED_SHIFT:
      return Object.assign({}, state, {
        selectedShift: action.selectedShift,
      });

    case SET_SHIFT_TYPE:
      return Object.assign({}, state, {
        shiftType: action.shiftType,
      });
    case RESET_SHIFT_FILTER:
      return Object.assign({}, state, {
        shiftType: initialState.shiftType,
        fieldFilter: initialState.fieldFilter,
        cropFilter: initialState.cropFilter,
        startDate: moment().startOf('year'),
        endDate: moment().endOf('year'),
      });
    default:
      return state;
  }
}

export default shiftReducer;
