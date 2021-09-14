import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart } from './userFarmSlice';
import { pick } from '../util/pick';
import { createSelector } from 'reselect';

export const getHarvestUseType = (obj) => {
  return pick(obj, [
    'harvest_use_type_id',
    'harvest_use_type_name',
    'farm_id',
    'harvest_use_type_translation_key',
  ]);
};

const addManyHarvestUseTypes = (state, { payload: harvestUseTypes }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  harvestUseTypeAdapter.upsertMany(
    state,
    harvestUseTypes.map((types) => getHarvestUseType(types)),
  );
};

const harvestUseTypeAdapter = createEntityAdapter({
  selectId: (harvestUseType) => harvestUseType.harvest_use_type_id,
});

const harvestUseTypeSlice = createSlice({
  name: 'harvestUseTypeReducer',
  initialState: harvestUseTypeAdapter.getInitialState({
    loading: false,
    error: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingHarvestUseTypeStart: onLoadingStart,
    onLoadingHarvestUseTypeFail: onLoadingFail,
    getHarvestUseTypesSuccess: addManyHarvestUseTypes,
  },
});

export const {
  onLoadingHarvestUseTypeStart,
  onLoadingHarvestUseTypeFail,
  harvestUseTypes,
  getHarvestUseTypesSuccess,
} = harvestUseTypeSlice.actions;
export default harvestUseTypeSlice.reducer;

export const harvestUseTypeReducerSelector = (state) =>
  state.entitiesReducer[harvestUseTypeSlice.name];

const harvestUseTypeSelectors = harvestUseTypeAdapter.getSelectors(
  (state) => state.entitiesReducer[harvestUseTypeSlice.name],
);

export const harvestUseTypeEntitiesSelector = harvestUseTypeSelectors.selectEntities;

export const defaultHarvestUseTypesSelector = createSelector(
  [harvestUseTypeSelectors.selectAll],
  (harvestUseTypes) => harvestUseTypes.filter(({ farm_id }) => farm_id === null),
);

export const userCreatedTaskTypes = createSelector(
  [harvestUseTypeSelectors.selectAll],
  (harvestUseTypes) => harvestUseTypes.filter(({ farm_id }) => farm_id !== null),
);

export const harvestUseTypesSelector = createSelector(
  [harvestUseTypeSelectors.selectAll, loginSelector],
  (harvestUseTypes, { farm_id }) => {
    return harvestUseTypes.filter(
      (harvestUseType) => harvestUseType.farm_id === farm_id || !harvestUseType.farm_id,
    );
  },
);

export const harvestUseTypeById = (harvest_use_type_id) => (state) =>
  harvestUseTypeSelectors.selectById(state, harvest_use_type_id);
