import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart } from './userFarmSlice';
import { pick } from '../util/pick';
import { createSelector } from 'reselect';

export const getTaskType = (obj) => {
  return pick(obj, [
    'task_type_id',
    'task_name',
    'task_translation_key',
    'farm_id',
  ]);
};

const noCropsTaskTypes = [ 'CLEANING' ];

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
    deleteTaskSuccess: taskTypeAdapter.removeOne,
  },
});
export const {
  onLoadingProductFail,
  taskTypes,
  getTaskTypesSuccess,
} = taskTypeSlice.actions;
export default taskTypeSlice.reducer;

export const taskTypeReducerSelector = (state) => state.entitiesReducer[taskTypeSlice.name];

export const taskTypeEntitiesSelector = createSelector(taskTypeReducerSelector, ({ ids, entities }) => {
  return ids.map((id) => entities[id]);
});

const taskTypeSelector = taskTypeAdapter.getSelectors(
  (state) => state.entitiesReducer[taskTypeSlice.name],
);

export const taskTypeById = (task_type_id) => (state) =>
  taskTypeSelector.selectById(state, task_type_id);


export const taskTypeNoCrops = createSelector([ taskTypeEntitiesSelector ],
  (taskTypes) =>
    taskTypes.filter(({ task_translation_key }) => noCropsTaskTypes.includes(task_translation_key))
      .map(({ task_type_id }) => task_type_id)
)
