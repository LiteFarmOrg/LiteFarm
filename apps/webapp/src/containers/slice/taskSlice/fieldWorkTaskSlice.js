import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart, onLoadingSuccess } from '../../userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../../../util/pick';

const fieldWorkTaskProperties = ['other_type', 'type', 'task_id', 'field_work_task_type'];

const getFieldWorkTask = (task) => {
  return pick(task, fieldWorkTaskProperties);
};

const upsertOneFieldWorkTask = (state, { payload: task }) => {
  fieldWorkTaskAdapter.upsertOne(state, getFieldWorkTask(task));
};
const upsertManyFieldWorkTask = (state, { payload: tasks }) => {
  fieldWorkTaskAdapter.upsertMany(
    state,
    tasks.map((task) => getFieldWorkTask(task)),
  );
  onLoadingSuccess(state);
};

const fieldWorkTaskAdapter = createEntityAdapter({
  selectId: (fieldWorkTask) => fieldWorkTask.task_id,
});

const fieldWorkTaskSlice = createSlice({
  name: 'fieldWorkTaskReducer',
  initialState: fieldWorkTaskAdapter.getInitialState({
    loading: false,
    error: undefined,
    task_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingFieldWorkTaskStart: onLoadingStart,
    onLoadingFieldWorkTaskFail: onLoadingFail,
    getFieldWorkTasksSuccess: upsertManyFieldWorkTask,
    postFieldWorkTaskSuccess: upsertOneFieldWorkTask,
    editFieldWorkTaskSuccess: upsertOneFieldWorkTask,
    deleteFieldWorkTaskSuccess: fieldWorkTaskAdapter.removeOne,
  },
});
export const {
  getFieldWorkTasksSuccess,
  postFieldWorkTaskSuccess,
  editFieldWorkTaskSuccess,
  onLoadingFieldWorkTaskStart,
  onLoadingFieldWorkTaskFail,
  deleteFieldWorkTaskSuccess,
} = fieldWorkTaskSlice.actions;
export default fieldWorkTaskSlice.reducer;

export const fieldWorkTaskReducerSelector = (state) =>
  state.entitiesReducer[fieldWorkTaskSlice.name];

const fieldWorkTaskSelectors = fieldWorkTaskAdapter.getSelectors(
  (state) => state.entitiesReducer[fieldWorkTaskSlice.name],
);

export const fieldWorkTaskEntitiesSelector = fieldWorkTaskSelectors.selectEntities;

export const fieldWorkTaskStatusSelector = createSelector(
  [fieldWorkTaskReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
