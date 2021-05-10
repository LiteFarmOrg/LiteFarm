import { createSlice } from '@reduxjs/toolkit';

const initialCropCatalogFilter = {
  STATUS: {},
  LOCATION: {},
  SUPPLIERS: {},
};

export const initialState = {
  cropCatalog: initialCropCatalogFilter,
};

const filterSliceReducer = createSlice({
  name: 'filterReducer',
  initialState,
  reducers: {
    resetFilters: (state) => initialState,
    resetCropCatalogFilter: (state) => {
      state.cropCatalog = initialCropCatalogFilter;
    },
    setCropCatalogFilter: (state, { payload: cropCatalogFilter }) => {
      Object.assign(state.cropCatalog, cropCatalogFilter);
    },
  },
});

export const {
  resetFilter,
  resetCropCatalogFilter,
  setCropCatalogFilter,
} = filterSliceReducer.actions;
export default filterSliceReducer.reducer;
export const cropCatalogFilterSelector = (state) =>
  state?.tempStateReducer[filterSliceReducer.name].cropCatalog;
