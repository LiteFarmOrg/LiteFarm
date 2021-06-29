import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart } from './userFarmSlice';
import { pick } from '../util';

export const getTransplantContainer = (obj) => {
  return pick(obj, [
    'transplantContainer_type',
    'in_ground',
    'location_id',
    'management_plan_id',
    'number_of_transplantContainers',
    'plant_spacing',
    'plant_spacing_unit',
    'planting_depth',
    'planting_depth_unit',
    'planting_soil',
    'plants_per_transplantContainer',
    'total_plants',
  ]);
};

const addOneTransplantContainer = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  transplantContainerAdapter.upsertOne(state, getTransplantContainer(payload));
};

const updateOneTransplantContainer = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  transplantContainerAdapter.upsertOne(state, getTransplantContainer(payload));
};

const addManyTransplantContainer = (state, { payload: transplantContainers }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  transplantContainerAdapter.upsertMany(
    state,
    transplantContainers.map((transplantContainer) => getTransplantContainer(transplantContainer)),
  );
};

const transplantContainerAdapter = createEntityAdapter({
  selectId: (transplantContainer) => transplantContainer.management_plan_id,
});

const transplantContainerSlice = createSlice({
  name: 'transplantContainerReducer',
  initialState: transplantContainerAdapter.getInitialState({
    loading: false,
    error: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingTransplantContainerStart: onLoadingStart,
    onLoadingTransplantContainerFail: onLoadingFail,
    getTransplantContainersSuccess: addManyTransplantContainer,
    postTransplantContainerSuccess: addOneTransplantContainer,
    putTransplantContainerSuccess(state, { payload: transplantContainer }) {
      transplantContainerAdapter.updateOne(state, {
        changes: transplantContainer,
        id: transplantContainer.management_plan_id,
      });
    },
    deleteTransplantContainerSuccess: transplantContainerAdapter.removeOne,
  },
});
export const {
  getTransplantContainersSuccess,
  postTransplantContainerSuccess,
  putTransplantContainerSuccess,
  onLoadingTransplantContainerStart,
  onLoadingTransplantContainerFail,
  deleteTransplantContainerSuccess,
} = transplantContainerSlice.actions;
export default transplantContainerSlice.reducer;

export const transplantContainerReducerSelector = (state) =>
  state.entitiesReducer[transplantContainerSlice.name];

export const transplantContainerSelectors = transplantContainerAdapter.getSelectors(
  (state) => state.entitiesReducer[transplantContainerSlice.name],
);
