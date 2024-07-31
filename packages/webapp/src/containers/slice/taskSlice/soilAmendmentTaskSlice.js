import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart, onLoadingSuccess } from '../../userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../../../util/pick';

const soilAmendmentTaskProperties = [
  'task_id',
  'method_id',
  'furrow_hole_depth',
  'furrow_hole_depth_unit',
  'other_application_method',
];

const getSoilAmendmentTask = (task) => {
  return pick(task, soilAmendmentTaskProperties);
};

const upsertOneSoilAmendmentTask = (state, { payload: task }) => {
  soilAmendmentTaskAdapter.upsertOne(state, getSoilAmendmentTask(task));
};
const upsertManySoilAmendmentTask = (state, { payload: tasks }) => {
  soilAmendmentTaskAdapter.upsertMany(
    state,
    tasks.map((task) => getSoilAmendmentTask(task)),
  );
  onLoadingSuccess(state);
};

const soilAmendmentTaskAdapter = createEntityAdapter({
  selectId: (soilAmendmentTask) => soilAmendmentTask.task_id,
});

const soilAmendmentTaskSlice = createSlice({
  name: 'soilAmendmentTaskReducer',
  initialState: soilAmendmentTaskAdapter.getInitialState({
    loading: false,
    error: undefined,
    task_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingSoilAmendmentTaskStart: onLoadingStart,
    onLoadingSoilAmendmentTaskFail: onLoadingFail,
    getSoilAmendmentTasksSuccess: upsertManySoilAmendmentTask,
    postSoilAmendmentTaskSuccess: upsertOneSoilAmendmentTask,
    editSoilAmendmentTaskSuccess: upsertOneSoilAmendmentTask,
    deleteSoilAmendmentTaskSuccess: soilAmendmentTaskAdapter.removeOne,
  },
});
export const {
  getSoilAmendmentTasksSuccess,
  postSoilAmendmentTaskSuccess,
  editSoilAmendmentTaskSuccess,
  onLoadingSoilAmendmentTaskStart,
  onLoadingSoilAmendmentTaskFail,
  deleteSoilAmendmentTaskSuccess,
} = soilAmendmentTaskSlice.actions;
export default soilAmendmentTaskSlice.reducer;

export const soilAmendmentTaskReducerSelector = (state) =>
  state.entitiesReducer[soilAmendmentTaskSlice.name];

const soilAmendmentTaskSelectors = soilAmendmentTaskAdapter.getSelectors(
  (state) => state.entitiesReducer[soilAmendmentTaskSlice.name],
);

export const soilAmendmentTaskEntitiesSelector = soilAmendmentTaskSelectors.selectEntities;

export const soilAmendmentTaskStatusSelector = createSelector(
  [soilAmendmentTaskReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
