import { createSlice } from '@reduxjs/toolkit';
import moment from 'moment';

export const initialState = {
  defaultDate: moment(),
  date: moment(),
};

const logSliceReducer = createSlice({
  name: 'logSliceReducer',
  initialState,
  reducers: {
    setDefaultDate: (state, { payload: defaultDate }) => {
      state.defaultDate = defaultDate;
    },
  },
});

export const { setDefaultDate } = logSliceReducer.actions;
export default logSliceReducer.reducer;
export const defaultDateSelector = (state) => ({
  defaultDate: state?.tempStateReducer[logSliceReducer.name].defaultDate,
});
export const logReducerSelector = (state) => state?.tempStateReducer[logSliceReducer.name];
