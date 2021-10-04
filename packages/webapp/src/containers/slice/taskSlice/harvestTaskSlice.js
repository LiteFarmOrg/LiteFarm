import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart, onLoadingSuccess } from '../../userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../../../util/pick';

const harvestTaskProperties = [
  'harvest_everything',
  'projected_quantity',
  'projected_quantity_unit',
  'actual_quantity',
  'actual_quantity_unit',
  'task_id',
  'harvest_use',
];

const getHarvestTask = (task) => {
  return pick(task, harvestTaskProperties);
};

const upsertOneHarvestTask = (state, { payload: task }) => {
  harvestTaskAdapter.upsertOne(state, getHarvestTask(task));
};
const upsertManyHarvestTask = (state, { payload: tasks }) => {
  harvestTaskAdapter.upsertMany(
    state,
    tasks.map((task) => getHarvestTask(task)),
  );
  onLoadingSuccess(state);
};

const harvestTaskAdapter = createEntityAdapter({
  selectId: (harvestTask) => harvestTask.task_id,
});

const harvestTaskSlice = createSlice({
  name: 'harvestTaskReducer',
  initialState: harvestTaskAdapter.getInitialState({
    loading: false,
    error: undefined,
    task_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingHarvestTaskStart: onLoadingStart,
    onLoadingHarvestTaskFail: onLoadingFail,
    getHarvestTasksSuccess: upsertManyHarvestTask,
    postHarvestTaskSuccess: upsertOneHarvestTask,
    editHarvestTaskSuccess: upsertOneHarvestTask,
    deleteHarvestTaskSuccess: harvestTaskAdapter.removeOne,
  },
});
export const {
  getHarvestTasksSuccess,
  postHarvestTaskSuccess,
  editHarvestTaskSuccess,
  onLoadingHarvestTaskStart,
  onLoadingHarvestTaskFail,
  deleteHarvestTaskSuccess,
} = harvestTaskSlice.actions;
export default harvestTaskSlice.reducer;

export const harvestTaskReducerSelector = (state) => state.entitiesReducer[harvestTaskSlice.name];

const harvestTaskSelectors = harvestTaskAdapter.getSelectors(
  (state) => state.entitiesReducer[harvestTaskSlice.name],
);

export const harvestTaskEntitiesSelector = harvestTaskSelectors.selectEntities;

export const harvestTaskStatusSelector = createSelector(
  [harvestTaskReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
