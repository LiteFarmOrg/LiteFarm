import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart } from '../../userFarmSlice';
import { pick } from '../../../util/pick';
import { createSelector } from 'reselect';
const irrigationTaskProperties = [
  'task_id',
  'type',
  'application_depth',
  'application_depth_unit',
  'default_measuring_type',
  'estimated_duration',
  'estimated_duration_unit',
  'estimated_flow_rate',
  'estimated_flow_rate_unit',
  'estimated_water_usage',
  'estimated_water_usage_unit',
  'default_location_flow_rate',
  'default_location_application_depth',
  'set_default_irrigation_task_type_location',
  'set_default_irrigation_task_type_measurement',
];
const getIrrigationTask = (task) => {
  return pick(task, irrigationTaskProperties);
};
const irrigationTaskAdapter = createEntityAdapter({
  selectId: (irrigationTask) => irrigationTask.task_id,
});

const upsertOneIrrigationTask = (state, { payload: task }) => {
  irrigationTaskAdapter.upsertOne(state, getIrrigationTask(task));
};
const upsertManyIrrigationTask = (state, { payload: tasks }) => {
  irrigationTaskAdapter.upsertMany(
    state,
    tasks.map((task) => getIrrigationTask(task)),
  );
};

const irrigationTaskSlice = createSlice({
  name: 'irrigationTaskReducer',
  initialState: irrigationTaskAdapter.getInitialState({
    loading: false,
    error: undefined,
    task_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingIrrigationTaskStart: onLoadingStart,
    onLoadingIrrigationTaskFail: onLoadingFail,
    getIrrigationTasksSuccess: upsertManyIrrigationTask,
    postIrrigationTaskSuccess: upsertOneIrrigationTask,
    editIrrigationTaskSuccess: upsertOneIrrigationTask,
    deleteIrrigationTaskSuccess: irrigationTaskAdapter.removeOne,
  },
});

export const {
  getIrrigationTasksSuccess,
  postIrrigationTaskSuccess,
  editIrrigationTaskSuccess,
  onLoadingIrrigationTaskStart,
  onLoadingIrrigationTaskFail,
  deleteIrrigationTaskSuccess,
} = irrigationTaskSlice.actions;

export default irrigationTaskSlice.reducer;

export const irrigationTaskReducerSelector = (state) =>
  state.entitiesReducer[irrigationTaskSlice.name];

const irrigationTaskSelectors = irrigationTaskAdapter.getSelectors(
  (state) => state.entitiesReducer[irrigationTaskSlice.name],
);

export const irrigationTaskEntitiesSelector = irrigationTaskSelectors.selectEntities;

export const irrigationTaskStatusSelector = createSelector(
  [irrigationTaskReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
