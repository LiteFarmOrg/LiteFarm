import { createSlice } from '@reduxjs/toolkit';
import moment from 'moment';

export const initialState = {
  defaultDate: null,
  date: moment(),
};

const logSliceReducer = createSlice({
  name: 'logSliceReducer',
  initialState,
  reducers: {
    setDefaultDate: (state, { payload: defaultDate }) => {
      state.defaultDate = defaultDate;
      state.date = defaultDate;
      console.log('inside slice');
      console.log(state.defaultDate);
    },
  },
});

export const { setDefaultDate } = logSliceReducer.actions;
export default logSliceReducer.reducer;
export const defaultDateSelector = (state) => ({
  defaultDate: state?.tempStateReducer[logSliceReducer.name].defaultDate,
});
export const logReducerSelector = (state) => state?.tempStateReducer[logSliceReducer.name];
