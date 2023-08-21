import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart, onLoadingSuccess } from '../../userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../../../util/pick';
import { plantingManagementPlanEntitiesSelector } from '../../plantingManagementPlanSlice';
import produce from 'immer';

const transplantTaskProperties = [
  'planting_management_plan_id',
  'task_id',
  'prev_planting_management_plan_id',
];

const getTransplantTask = (task) => {
  return pick(task, transplantTaskProperties);
};

const upsertOneTransplantTask = (state, { payload: task }) => {
  transplantTaskAdapter.upsertOne(state, getTransplantTask(task));
};
const upsertManyTransplantTask = (state, { payload: tasks }) => {
  transplantTaskAdapter.upsertMany(
    state,
    tasks.map((task) => getTransplantTask(task)),
  );
  onLoadingSuccess(state);
};

const transplantTaskAdapter = createEntityAdapter({
  selectId: (transplantTask) => transplantTask.task_id,
});

const transplantTaskSlice = createSlice({
  name: 'transplantTaskReducer',
  initialState: transplantTaskAdapter.getInitialState({
    loading: false,
    error: undefined,
    task_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingTransplantTaskStart: onLoadingStart,
    onLoadingTransplantTaskFail: onLoadingFail,
    getTransplantTasksSuccess: upsertManyTransplantTask,
    postTransplantTaskSuccess: upsertOneTransplantTask,
    editTransplantTaskSuccess: upsertOneTransplantTask,
    deleteTransplantTaskSuccess: transplantTaskAdapter.removeOne,
  },
});
export const {
  getTransplantTasksSuccess,
  postTransplantTaskSuccess,
  editTransplantTaskSuccess,
  onLoadingTransplantTaskStart,
  onLoadingTransplantTaskFail,
  deleteTransplantTaskSuccess,
} = transplantTaskSlice.actions;
export default transplantTaskSlice.reducer;

export const transplantTaskReducerSelector = (state) =>
  state.entitiesReducer[transplantTaskSlice.name];

const transplantTaskSelectors = transplantTaskAdapter.getSelectors(
  (state) => state.entitiesReducer[transplantTaskSlice.name],
);

export const transplantTaskEntitiesSelector = createSelector(
  [transplantTaskSelectors.selectEntities, plantingManagementPlanEntitiesSelector],
  (transplantTaskEntities, plantManagementPlanTaskEntities) => {
    return produce(transplantTaskEntities, (transplantTaskEntities) => {
      for (const task_id in transplantTaskEntities) {
        const {
          planting_management_plan_id,
          prev_planting_management_plan_id,
        } = transplantTaskEntities[task_id];
        transplantTaskEntities[task_id].planting_management_plan =
          plantManagementPlanTaskEntities[planting_management_plan_id];
        prev_planting_management_plan_id &&
          (transplantTaskEntities[task_id].prev_planting_management_plan =
            plantManagementPlanTaskEntities[prev_planting_management_plan_id]);
      }
    });
  },
);

export const transplantTasksByManagementPlanIdEntitiesSelector = createSelector(
  [transplantTaskEntitiesSelector],
  (transplantTaskEntities) => {
    return Object.values(transplantTaskEntities).reduce(
      (transplantTasksByManagementPlanIdEntities, transplantTask) => {
        const { management_plan_id } = transplantTask.planting_management_plan;
        if (!transplantTasksByManagementPlanIdEntities[management_plan_id]) {
          transplantTasksByManagementPlanIdEntities[management_plan_id] = [];
        }
        transplantTasksByManagementPlanIdEntities[management_plan_id].push(transplantTask);
        return transplantTasksByManagementPlanIdEntities;
      },
      {},
    );
  },
);

export const transplantTaskStatusSelector = createSelector(
  [transplantTaskReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
