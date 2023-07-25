import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util/pick';
import { cropVarietyReducerSelector } from './cropVarietySlice.js';

export const cropManagementPlanProperties = [
  'already_in_ground',
  'crop_age',
  'crop_age_unit',
  'estimated_revenue',
  'for_cover',
  'germination_date',
  'harvest_date',
  'is_seed',
  'is_wild',
  'management_plan_id',
  'needs_transplant',
  'plant_date',
  'seed_date',
  'termination_date',
  'transplant_date',
  'estimated_yield_unit',
  'estimated_yield',
  'estimated_price_per_mass',
  'estimated_price_per_mass_unit',
];

export const getCropManagementPlan = (obj) => {
  return pick(obj, cropManagementPlanProperties);
};

const addOneCropManagementPlan = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  cropManagementPlanAdapter.upsertOne(state, getCropManagementPlan(payload));
};

const updateOneCropManagementPlan = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  cropManagementPlanAdapter.upsertOne(state, getCropManagementPlan(payload));
};

const addManyCropManagementPlan = (state, { payload: cropManagementPlans }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  cropManagementPlanAdapter.upsertMany(
    state,
    cropManagementPlans.map((cropManagementPlan) => getCropManagementPlan(cropManagementPlan)),
  );
};

const cropManagementPlanAdapter = createEntityAdapter({
  selectId: (cropManagementPlan) => cropManagementPlan.management_plan_id,
});

const cropManagementPlanSlice = createSlice({
  name: 'cropManagementPlanReducer',
  initialState: cropManagementPlanAdapter.getInitialState({
    loading: false,
    error: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingCropManagementPlanStart: onLoadingStart,
    onLoadingCropManagementPlanFail: onLoadingFail,
    getCropManagementPlansSuccess: addManyCropManagementPlan,
    deleteCropManagementPlanSuccess: cropManagementPlanAdapter.removeOne,
  },
});
export const {
  getCropManagementPlansSuccess,
  onLoadingCropManagementPlanStart,
  onLoadingCropManagementPlanFail,
  deleteCropManagementPlanSuccess,
} = cropManagementPlanSlice.actions;
export default cropManagementPlanSlice.reducer;

export const cropManagementPlanReducerSelector = (state) =>
  state.entitiesReducer[cropManagementPlanSlice.name];

export const cropManagementPlanSelectors = cropManagementPlanAdapter.getSelectors(
  (state) => state.entitiesReducer[cropManagementPlanSlice.name],
);

export const cropManagementPlanEntitiesSelector = cropManagementPlanSelectors.selectEntities;

export const cropManagementPlanStatusSelector = createSelector(
  [cropVarietyReducerSelector],
  ({ loading, error }) => {
    return { loading, error };
  },
);
