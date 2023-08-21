import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart } from './userFarmSlice';
import { pick } from '../util/pick';

export const containerMethodProperties = [
  'container_type',
  'in_ground',
  'number_of_containers',
  'plant_spacing',
  'plant_spacing_unit',
  'planting_depth',
  'planting_depth_unit',
  'planting_management_plan_id',
  'planting_soil',
  'plants_per_container',
  'total_plants',
];
const getContainerMethod = (obj) => {
  return pick(obj, containerMethodProperties);
};

const addOneContainerMethod = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  containerMethodAdapter.upsertOne(state, getContainerMethod(payload));
};

const updateOneContainerMethod = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  containerMethodAdapter.upsertOne(state, getContainerMethod(payload));
};

const addManyContainerMethod = (state, { payload: containerMethods }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  containerMethodAdapter.upsertMany(
    state,
    containerMethods.map((containerMethod) => getContainerMethod(containerMethod)),
  );
};

const containerMethodAdapter = createEntityAdapter({
  selectId: (containerMethod) => containerMethod.planting_management_plan_id,
});

const containerMethodMethodSlice = createSlice({
  name: 'containerMethodReducer',
  initialState: containerMethodAdapter.getInitialState({
    loading: false,
    error: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingContainerMethodStart: onLoadingStart,
    onLoadingContainerMethodFail: onLoadingFail,
    getContainerMethodsSuccess: addManyContainerMethod,
    postContainerMethodSuccess: addOneContainerMethod,
    putContainerMethodSuccess(state, { payload: containerMethod }) {
      containerMethodAdapter.updateOne(state, {
        changes: containerMethod,
        id: containerMethod.management_plan_id,
      });
    },
    deleteContainerMethodSuccess: containerMethodAdapter.removeOne,
  },
});
export const {
  getContainerMethodsSuccess,
  postContainerMethodSuccess,
  putContainerMethodSuccess,
  onLoadingContainerMethodStart,
  onLoadingContainerMethodFail,
  deleteContainerMethodSuccess,
} = containerMethodMethodSlice.actions;
export default containerMethodMethodSlice.reducer;

export const containerMethodReducerSelector = (state) =>
  state.entitiesReducer[containerMethodMethodSlice.name];

export const containerMethodSelectors = containerMethodAdapter.getSelectors(
  (state) => state.entitiesReducer[containerMethodMethodSlice.name],
);
