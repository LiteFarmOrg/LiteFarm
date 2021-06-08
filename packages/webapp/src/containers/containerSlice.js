import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart } from './userFarmSlice';
import { pick } from '../util';
import { cropManagementPlanProperties } from './broadcastSlice';

export const containerProperties = [
  'container_type',
  'in_ground',
  'number_of_containers',
  'plant_spacing',
  'plant_spacing_unit',
  'planting_depth',
  'planting_depth_unit',
  'planting_soil',
  'plants_per_container',
  'total_plants',
];
const getContainer = (obj) => {
  return pick(obj, [...cropManagementPlanProperties, ...containerProperties]);
};

const addOneContainer = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  containerAdapter.upsertOne(state, getContainer(payload));
};

const updateOneContainer = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  containerAdapter.upsertOne(state, getContainer(payload));
};

const addManyContainer = (state, { payload: containers }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  containerAdapter.upsertMany(
    state,
    containers.map((container) => getContainer(container)),
  );
};

const containerAdapter = createEntityAdapter({
  selectId: (container) => container.management_plan_id,
});

const containerSlice = createSlice({
  name: 'containerReducer',
  initialState: containerAdapter.getInitialState({
    loading: false,
    error: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingContainerStart: onLoadingStart,
    onLoadingContainerFail: onLoadingFail,
    getContainersSuccess: addManyContainer,
    postContainerSuccess: addOneContainer,
    putContainerSuccess(state, { payload: container }) {
      containerAdapter.updateOne(state, {
        changes: container,
        id: container.management_plan_id,
      });
    },
    deleteContainerSuccess: containerAdapter.removeOne,
  },
});
export const {
  getContainersSuccess,
  postContainerSuccess,
  putContainerSuccess,
  onLoadingContainerStart,
  onLoadingContainerFail,
  deleteContainerSuccess,
} = containerSlice.actions;
export default containerSlice.reducer;

export const containerReducerSelector = (state) => state.entitiesReducer[containerSlice.name];

export const containerSelectors = containerAdapter.getSelectors(
  (state) => state.entitiesReducer[containerSlice.name],
);
