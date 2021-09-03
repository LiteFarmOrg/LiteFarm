import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart } from './userFarmSlice';
import { pick } from '../util/pick';
import { createSelector } from 'reselect';

export const getTaskType = (obj) => {
  return pick(obj, ['task_type_id', 'task_name', 'task_translation_key', 'farm_id', 'deleted']);
};

const noCropsTaskTypes = ['CLEANING'];

const addManyTaskTypes = (state, { payload: taskTypes }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  taskTypeAdapter.upsertMany(
    state,
    taskTypes.map((types) => getTaskType(types)),
  );
};

const taskTypeAdapter = createEntityAdapter({
  selectId: (taskType) => taskType.task_type_id,
});

const taskTypeSlice = createSlice({
  name: 'taskTypeReducer',
  initialState: taskTypeAdapter.getInitialState({
    loading: false,
    error: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingProductStart: onLoadingStart,
    onLoadingProductFail: onLoadingFail,
    getTaskTypesSuccess: addManyTaskTypes,
    deleteTaskTypeSuccess: taskTypeAdapter.removeOne,
  },
});
export const {
  onLoadingProductFail,
  taskTypes,
  getTaskTypesSuccess,
  deleteTaskTypeSuccess,
} = taskTypeSlice.actions;
export default taskTypeSlice.reducer;

export const taskTypeReducerSelector = (state) => state.entitiesReducer[taskTypeSlice.name];

const taskTypeSelectors = taskTypeAdapter.getSelectors(
  (state) => state.entitiesReducer[taskTypeSlice.name],
);

export const taskTypeEntitiesSelector = taskTypeSelectors.selectEntities;

export const defaultTaskTypesSelector = createSelector([taskTypeSelectors.selectAll], (taskTypes) =>
  taskTypes.filter(({ farm_id, deleted }) => farm_id === null && !deleted),
);

export const userCreatedTaskTypes = createSelector([taskTypeSelectors.selectAll], (taskTypes) =>
  taskTypes.filter(({ farm_id, deleted }) => farm_id !== null && !deleted),
);

export const taskTypesSelector = createSelector(
  [taskTypeSelectors.selectAll, loginSelector],
  (taskTypes, { farm_id }) => {
    return taskTypes.filter((task) => task.farm_id === farm_id || !task.farm_id);
  },
);

export const taskTypeById = (task_type_id) => (state) =>
  taskTypeSelectors.selectById(state, task_type_id);

export const taskTypeIdNoCropsSelector = createSelector([taskTypesSelector], (taskTypes) =>
  taskTypes
    .filter(({ task_translation_key }) => noCropsTaskTypes.includes(task_translation_key))
    .map(({ task_type_id }) => task_type_id),
);
