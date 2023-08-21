import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart, onLoadingSuccess } from '../../userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../../../util/pick';

const cleaningTaskProperties = [
  'other_purpose',
  'purpose',
  'task_id',
  'product_id',
  'product_quantity',
  'product_quantity_unit',
  'agent_used',
  'cleaning_target',
  'water_usage',
  'water_usage_unit',
];

const getCleaningTask = (task) => {
  return pick(task, cleaningTaskProperties);
};

const upsertOneCleaningTask = (state, { payload: task }) => {
  cleaningTaskAdapter.upsertOne(state, getCleaningTask(task));
};
const upsertManyCleaningTask = (state, { payload: tasks }) => {
  cleaningTaskAdapter.upsertMany(
    state,
    tasks.map((task) => getCleaningTask(task)),
  );
  onLoadingSuccess(state);
};

const cleaningTaskAdapter = createEntityAdapter({
  selectId: (cleaningTask) => cleaningTask.task_id,
});

const cleaningTaskSlice = createSlice({
  name: 'cleaningTaskReducer',
  initialState: cleaningTaskAdapter.getInitialState({
    loading: false,
    error: undefined,
    task_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingCleaningTaskStart: onLoadingStart,
    onLoadingCleaningTaskFail: onLoadingFail,
    getCleaningTasksSuccess: upsertManyCleaningTask,
    postCleaningTaskSuccess: upsertOneCleaningTask,
    editCleaningTaskSuccess: upsertOneCleaningTask,
    deleteCleaningTaskSuccess: cleaningTaskAdapter.removeOne,
  },
});
export const {
  getCleaningTasksSuccess,
  postCleaningTaskSuccess,
  editCleaningTaskSuccess,
  onLoadingCleaningTaskStart,
  onLoadingCleaningTaskFail,
  deleteCleaningTaskSuccess,
} = cleaningTaskSlice.actions;
export default cleaningTaskSlice.reducer;

export const cleaningTaskReducerSelector = (state) => state.entitiesReducer[cleaningTaskSlice.name];

const cleaningTaskSelectors = cleaningTaskAdapter.getSelectors(
  (state) => state.entitiesReducer[cleaningTaskSlice.name],
);

export const cleaningTaskEntitiesSelector = cleaningTaskSelectors.selectEntities;

export const cleaningTaskStatusSelector = createSelector(
  [cleaningTaskReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
