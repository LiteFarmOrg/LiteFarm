import { createSlice } from '@reduxjs/toolkit';
import moment from 'moment';

export const initialState = {
  defaultDate: moment(),
  defaultField: null,
  defaultCrop: null,
  defaultQuantity: null,
  defaultNotes: null,
  activity_kind: null,
};

const logSliceReducer = createSlice({
  name: 'logSliceReducer',
  initialState,
  reducers: {
    harvestLogData: (state, { payload: harvestLog }) => {
      state.defaultDate = harvestLog.defaultDate;
      state.defaultField = harvestLog.defaultField;
      state.defaultCrop = harvestLog.defaultCrop;
      state.defaultQuantity = harvestLog.defaultQuantity;
      state.defaultNotes = harvestLog.defaultNotes;
    },
    resetHarvestLog: (state) => initialState,
    harvestFormData: (state, { payload: formData }) => {
      state.activity_kind = formData.activity_kind;
      state.date = formData.date;
      state.crops = formData.crops;
      state.fields = formData.fields;
      state.notes = formData.notes;
      state.quantity_kg = formData.quantity_kg;
    },
  },
});

export const { harvestLogData, resetHarvestLog, harvestFormData } = logSliceReducer.actions;
export default logSliceReducer.reducer;
export const harvestLogDataSelector = (state) => ({
  defaultDate: state?.tempStateReducer[logSliceReducer.name].defaultDate,
  defaultField: state?.tempStateReducer[logSliceReducer.name].defaultField,
  defaultCrop: state?.tempStateReducer[logSliceReducer.name].defaultCrop,
  defaultQuantity: state?.tempStateReducer[logSliceReducer.name].defaultQuantity,
  defaultNotes: state?.tempStateReducer[logSliceReducer.name].defaultNotes,
});
export const logReducerSelector = (state) => state?.tempStateReducer[logSliceReducer.name];
