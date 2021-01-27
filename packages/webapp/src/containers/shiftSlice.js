import { createSlice } from '@reduxjs/toolkit';
import moment from 'moment';

export const initialState = {
  worker: null,
  shift_date: moment(),
  selectedTasks: [],
};

const shiftStepReducer = createSlice({
  name: 'shiftStepReducer',
  initialState,
  reducers: {
    stepOneData: (state, { payload: shift }) => {
      state.worker = shift.worker;
      state.shift_date = shift.shift_date;
      state.selectedTasks = shift.selectedTasks;
    },
  },
});

export const { stepOneData } = shiftStepReducer.actions;
export default shiftStepReducer.reducer;
export const stepOneSelector = (state) => ({
  worker: state?.tempStateReducer[shiftStepReducer.name].worker,
  shift_date: state?.tempStateReducer[shiftStepReducer.name].shift_date,
  selectedTasks: state?.tempStateReducer[shiftStepReducer.name].selectedTasks,
});
export const shiftReducerSelector = (state) => state?.tempStateReducer[shiftStepReducer.name];
