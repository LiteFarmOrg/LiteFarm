import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { VALID_ON } from './Filter/constants';
import { getDateInputFormat } from '../util/moment';

const initialCropCatalogueFilter = {
  STATUS: {},
  LOCATION: {},
  SUPPLIERS: {},
  date: undefined,
};
const initialDocumentsFilter = {
  TYPE: {},
  VALID_ON: undefined,
};

export const initialState = {
  cropCatalogue: initialCropCatalogueFilter,
  documents: initialDocumentsFilter,
};

const filterSliceReducer = createSlice({
  name: 'filterReducer',
  initialState,
  reducers: {
    resetFilters: (state) => initialState,
    resetCropCatalogueFilter: (state) => {
      state.cropCatalogue = initialCropCatalogueFilter;
    },
    setCropCatalogueFilter: (state, { payload: cropCatalogueFilter }) => {
      Object.assign(state.cropCatalogue, cropCatalogueFilter);
    },
    setCropCatalogueFilterDate: (state, { payload: date }) => {
      state.cropCatalogue.date = date;
    },
    setCropVarietyFilterDefault: (state, { payload: cropId }) => {
      state[`${cropId}`] = initialCropCatalogueFilter;
    },
    setCropVarietyFilter: (state, { payload: { cropId, cropVarietyFilter } }) => {
      Object.assign(state[`${cropId}`], cropVarietyFilter);
    },
    removeFilter: (state, { payload: { pageFilterKey, filterKey, value } }) => {
      state[pageFilterKey][filterKey][value].active = false;
    },
    removeNonFilterValue: (state, { payload: { pageFilterKey, filterKey } }) => {
      state[pageFilterKey][filterKey] = undefined;
    },
    resetDocumentsFilter: (state) => {
      state.documents = initialDocumentsFilter;
    },
    setDocumentsFilter: (state, { payload: documentsFilter }) => {
      Object.assign(state.documents, documentsFilter);
    },
  },
});

export const {
  resetFilters,
  resetCropCatalogueFilter,
  setCropCatalogueFilter,
  setCropCatalogueFilterDate,
  setCropVarietyFilterDefault,
  setCropVarietyFilter,
  removeFilter,
  removeNonFilterValue,
  resetDocumentsFilter,
  setDocumentsFilter,
} = filterSliceReducer.actions;
export default filterSliceReducer.reducer;

const filterReducerSelector = (state) => {
  return state?.tempStateReducer[filterSliceReducer.name];
};

export const cropCatalogueFilterSelector = createSelector(
  [filterReducerSelector],
  (filterReducer) => filterReducer.cropCatalogue,
);
export const cropVarietyFilterSelector = (cropId) => {
  return createSelector([filterReducerSelector], (filterReducer) => filterReducer[`${cropId}`]);
};
export const documentsFilterSelector = createSelector(
  [filterReducerSelector],
  (filterReducer) => filterReducer.documents,
);
export const cropCatalogueFilterDateSelector = createSelector(
  [cropCatalogueFilterSelector],
  (cropCatalogueFilter) => cropCatalogueFilter.date || getDateInputFormat(new Date()),
);

export const isFilterCurrentlyActiveSelector = (pageFilterKey) => {
  return createSelector([filterReducerSelector], (filterReducer) => {
    const targetPageFilter = filterReducer[pageFilterKey];
    let isActive = false;
    for (const filterKey in targetPageFilter) {
      const filter = targetPageFilter[filterKey];
      if (filterKey === 'date') continue; // TODO: this is hacky, need to figure out if date can be stored differently, or if we can just remove it from initial state
      if (filterKey === VALID_ON) {
        isActive = isActive || !!filter;
        continue;
      }
      isActive = Object.values(filter).reduce((acc, curr) => {
        return acc || curr.active;
      }, isActive);
    }
    return isActive;
  });
};
