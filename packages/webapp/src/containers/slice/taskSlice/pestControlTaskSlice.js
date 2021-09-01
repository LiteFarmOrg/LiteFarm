import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart, onLoadingSuccess } from '../../userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../../../util/pick';

const pestControlTaskProperties = [
  'control_method',
  'other_method',
  'pest_target',
  'product_id',
  'product_quantity',
  'product_quantity_unit',
  'task_id',
];

const getPestControlTask = (task) => {
  return pick(task, pestControlTaskProperties);
};

const upsertOnePestControlTask = (state, { payload: task }) => {
  pestControlTaskAdapter.upsertOne(state, getPestControlTask(task));
};
const upsertManyPestControlTask = (state, { payload: tasks }) => {
  pestControlTaskAdapter.upsertMany(
    state,
    tasks.map((task) => getPestControlTask(task)),
  );
  onLoadingSuccess(state);
};

const pestControlTaskAdapter = createEntityAdapter({
  selectId: (pestControlTask) => pestControlTask.task_id,
});

const pestControlTaskSlice = createSlice({
  name: 'pestControlTaskReducer',
  initialState: pestControlTaskAdapter.getInitialState({
    loading: false,
    error: undefined,
    task_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingPestControlTaskStart: onLoadingStart,
    onLoadingPestControlTaskFail: onLoadingFail,
    getPestControlTasksSuccess: upsertManyPestControlTask,
    postPestControlTaskSuccess: upsertOnePestControlTask,
    editPestControlTaskSuccess: upsertOnePestControlTask,
    deletePestControlTaskSuccess: pestControlTaskAdapter.removeOne,
  },
});
export const {
  getPestControlTasksSuccess,
  postPestControlTaskSuccess,
  editPestControlTaskSuccess,
  onLoadingPestControlTaskStart,
  onLoadingPestControlTaskFail,
  deletePestControlTaskSuccess,
} = pestControlTaskSlice.actions;
export default pestControlTaskSlice.reducer;

export const pestControlTaskReducerSelector = (state) =>
  state.entitiesReducer[pestControlTaskSlice.name];

const pestControlTaskSelectors = pestControlTaskAdapter.getSelectors(
  (state) => state.entitiesReducer[pestControlTaskSlice.name],
);

export const pestControlTaskEntitiesSelector = pestControlTaskSelectors.selectEntities;

export const pestControlTaskStatusSelector = createSelector(
  [pestControlTaskReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
