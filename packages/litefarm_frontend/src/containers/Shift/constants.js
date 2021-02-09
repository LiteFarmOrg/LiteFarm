/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (constants.js) is part of LiteFarm.
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

export const GET_TASK_TYPES = 'GET_TASK_TYPES';
export const SET_TASK_TYPES_IN_STATE = 'SET_TASK_TYPES_IN_STATE';
export const ADD_TASK_TYPE = 'ADD_TASK_TYPE';
export const SET_SELECTED_TASKS = 'SET_SELECTED_TASKS';
export const SET_SHIFT_DURATION = 'SET_SHIFT_DURATION';
export const SET_START_END_SHIFT = 'SET_START_END_SHIFT';
export const SUBMIT_SHIFT = 'SUBMIT_SHIFT';
export const GET_SHIFTS = 'GET_SHIFTS';
export const SET_SHIFTS_IN_SHIFT = 'SET_SHIFTS_IN_SHIFT';
export const SET_SELECTED_SHIFT = 'SET_SELECTED_SHIFT';
export const DELETE_SHIFT = 'DELETE_SHIFT';
export const UPDATE_SHIFT = 'UPDATE_SHIFT';
export const GET_ALL_SHIFT = 'GET_ALL_SHIFT';
export const SUBMIT_MULTI_SHIFT = 'SUBMIT_MULTI_SHIFT';

export const shiftRatings = [
  { key: 'happy', label: 'Happy', icon: '😃' },
  { key: 'very happy', label: 'Very Happy', icon: '😆' },
  { key: 'neutral', label: 'Neutral', icon: '😕' },
  { key: 'sad', label: 'Sad', icon: '😢' },
  { key: 'very sad', label: 'Very Sad', icon: '😭' },
  { key: 'na', label: 'Rather Not Say', icon: '🤭' },
];
