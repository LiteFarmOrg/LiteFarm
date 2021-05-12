import { createSlice } from '@reduxjs/toolkit';

const initialCropCatalogueFilter = {
  STATUS: {},
  LOCATION: {},
  SUPPLIERS: {},
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
  },
});

export const {
  resetFilter,
  resetCropCatalogueFilter,
  setCropCatalogueFilter,
} = filterSliceReducer.actions;
export default filterSliceReducer.reducer;
export const cropCatalogueFilterSelector = (state) =>
  state?.tempStateReducer[filterSliceReducer.name].cropCatalogue;
