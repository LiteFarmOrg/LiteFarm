import { createSlice } from '@reduxjs/toolkit';
import moment from 'moment';

export const initialState = {
  defaultDate: moment(),
  date: moment(),
  defaultField: null,
  defaultCrop: null,
  defaultQuantity: null,
  defaultNotes: null,
  activity_kind: null,
  activity_id: null,
  validQuantity: null,
  selectedUseTypes: [],
  crops: null,
  fields: null,
  notes: null,
  quantity_kg: null,
  validQuantity: true,
  isEditStepOne: false,
  isEditStepTwo: false,
  isEditStepThree: false,
  isEdit: false,
  convertQuantity: false,
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
      state.validQuantity = harvestLog.validQuantity;
      state.selectedUseTypes = harvestLog.selectedUseTypes;
      state.validQuantity = harvestLog.validQuantity;
    },
    resetHarvestLog: (state) => initialState,
    harvestFormData: (state, { payload: formData }) => {
      state.activity_id = formData.activity_id;
      state.activity_kind = formData.activity_kind;
      state.date = formData.date;
      state.crops = formData.crops;
      state.fields = formData.fields;
      state.notes = formData.notes;
      state.quantity_kg = formData.quantity_kg;
    },
    canEditStepOne: (state, { payload: isEditStepOne }) => {
      state.isEditStepOne = isEditStepOne;
    },
    canEditStepTwo: (state, { payload: isEditStepTwo }) => {
      state.isEditStepTwo = isEditStepTwo;
    },
    canEditStepThree: (state, { payload: isEditStepThree }) => {
      state.isEditStepThree = isEditStepThree;
    },
    canEdit: (state, { payload: isEdit }) => {
      state.isEdit = isEdit;
    },
    canConvertQuantity: (state, { payload: convertQuantity }) => {
      state.convertQuantity = convertQuantity;
    },
  },
});

export const {
  harvestLogData,
  resetHarvestLog,
  harvestFormData,
  canEditStepOne,
  canEditStepTwo,
  canEditStepThree,
  canEdit,
  canConvertQuantity,
} = logSliceReducer.actions;
export default logSliceReducer.reducer;
export const harvestLogDataSelector = (state) => ({
  defaultDate: state?.tempStateReducer[logSliceReducer.name].defaultDate,
  defaultField: state?.tempStateReducer[logSliceReducer.name].defaultField,
  defaultCrop: state?.tempStateReducer[logSliceReducer.name].defaultCrop,
  defaultQuantity: state?.tempStateReducer[logSliceReducer.name].defaultQuantity,
  defaultNotes: state?.tempStateReducer[logSliceReducer.name].defaultNotes,
  validQuantity: state?.tempStateReducer[logSliceReducer.name].validQuantity,
  selectedUseTypes: state?.tempStateReducer[logSliceReducer.name].selectedUseTypes,
  validQuantity: state?.tempStateReducer[logSliceReducer.name].validQuantity,
});
export const harvestFormDataSelector = (state) => ({
  activity_id: state?.tempStateReducer[logSliceReducer.name].activity_id,
  activity_kind: state?.tempStateReducer[logSliceReducer.name].activity_kind,
  date: state?.tempStateReducer[logSliceReducer.name].date,
  crops: state?.tempStateReducer[logSliceReducer.name].crops,
  fields: state?.tempStateReducer[logSliceReducer.name].fields,
  quantity_kg: state?.tempStateReducer[logSliceReducer.name].quantity_kg,
});
export const canEditStepOneSelector = (state) => ({
  isEditStepOne: state?.tempStateReducer[logSliceReducer.name].isEditStepOne,
});
export const canEditStepTwoSelector = (state) => ({
  isEditStepTwo: state?.tempStateReducer[logSliceReducer.name].isEditStepTwo,
});
export const canEditStepThreeSelector = (state) => ({
  isEditStepThree: state?.tempStateReducer[logSliceReducer.name].isEditStepThree,
});
export const canEditSelector = (state) => ({
  isEdit: state?.tempStateReducer[logSliceReducer.name].isEdit,
});
export const canConvertQuantitySelector = (state) => ({
  convertQuantity: state?.tempStateReducer[logSliceReducer.name].convertQuantity,
});
export const logReducerSelector = (state) => state?.tempStateReducer[logSliceReducer.name];
