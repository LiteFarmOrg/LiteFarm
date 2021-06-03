import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { getDateInputFormat } from '../components/LocationDetailLayout/utils';

const initialCropCatalogueFilter = {
  STATUS: {},
  LOCATION: {},
  SUPPLIERS: {},
  date: undefined,
};

export const initialState = {
  cropCatalogue: initialCropCatalogueFilter,
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
    removeFilter: (state, { payload: { pageFilterKey, filterKey, value } }) => {
      state[pageFilterKey][filterKey][value] = false;
    },
  },
});

export const {
  resetFilters,
  resetCropCatalogueFilter,
  setCropCatalogueFilter,
  setCropCatalogueFilterDate,
  removeFilter,
} = filterSliceReducer.actions;
export default filterSliceReducer.reducer;

const filterReducerSelector = (state) => {
  return state?.tempStateReducer[filterSliceReducer.name];
};

export const cropCatalogueFilterSelector = createSelector(
  [filterReducerSelector],
  (filterReducer) => filterReducer.cropCatalogue,
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
      if (filterKey === 'date') continue; // TODO: this is hacky, need to figure out if date can be stored differently, or if we can just remove it from initial state
      const filter = targetPageFilter[filterKey];
      isActive = Object.values(filter).reduce((acc, curr) => {
        return acc || curr.active;
      }, isActive);
    }
    return isActive;
  });
};
