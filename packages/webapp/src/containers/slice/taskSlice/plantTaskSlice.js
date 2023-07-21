import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart, onLoadingSuccess } from '../../userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../../../util/pick';
import {
  plantingManagementPlanEntitiesSelector,
  plantingManagementPlanStatusSelector,
} from '../../plantingManagementPlanSlice';
import produce from 'immer';
import { getTrackedReducerSelector } from '../../../util/reselect/reselect';

const plantTaskProperties = ['planting_management_plan_id', 'task_id'];

const getPlantTask = (task) => {
  return pick(task, plantTaskProperties);
};

const upsertOnePlantTask = (state, { payload: task }) => {
  plantTaskAdapter.upsertOne(state, getPlantTask(task));
};
const upsertManyPlantTask = (state, { payload: tasks }) => {
  plantTaskAdapter.upsertMany(
    state,
    tasks.map((task) => getPlantTask(task)),
  );
  onLoadingSuccess(state);
};

const plantTaskAdapter = createEntityAdapter({
  selectId: (plantTask) => plantTask.task_id,
});

const plantTaskSlice = createSlice({
  name: 'plantTaskReducer',
  initialState: plantTaskAdapter.getInitialState({
    loading: false,
    error: undefined,
    task_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingPlantTaskStart: onLoadingStart,
    onLoadingPlantTaskFail: onLoadingFail,
    getPlantTasksSuccess: upsertManyPlantTask,
    postPlantTaskSuccess: upsertOnePlantTask,
    editPlantTaskSuccess: upsertOnePlantTask,
    deletePlantTaskSuccess: plantTaskAdapter.removeOne,
  },
});
export const {
  getPlantTasksSuccess,
  postPlantTaskSuccess,
  editPlantTaskSuccess,
  onLoadingPlantTaskStart,
  onLoadingPlantTaskFail,
  deletePlantTaskSuccess,
} = plantTaskSlice.actions;
export default plantTaskSlice.reducer;

export const plantTaskReducerSelector = (state) => state.entitiesReducer[plantTaskSlice.name];

const plantTaskSelectors = plantTaskAdapter.getSelectors(
  getTrackedReducerSelector(plantTaskSlice.name, plantingManagementPlanStatusSelector),
);

export const plantTaskEntitiesSelector = createSelector(
  [plantTaskSelectors.selectEntities, plantingManagementPlanEntitiesSelector],
  (plantTaskEntities, plantManagementPlanTaskEntities) => {
    return produce(plantTaskEntities, (plantTaskEntities) => {
      for (const task_id in plantTaskEntities) {
        const { planting_management_plan_id } = plantTaskEntities[task_id];
        plantTaskEntities[task_id].planting_management_plan =
          plantManagementPlanTaskEntities[planting_management_plan_id];
      }
    });
  },
);

export const plantTasksByManagementPlanIdEntitiesSelector = createSelector(
  [plantTaskEntitiesSelector],
  (plantTaskEntities) => {
    return Object.values(plantTaskEntities).reduce(
      (plantTasksByManagementPlanIdEntities, plantTask) => {
        const { management_plan_id } = plantTask.planting_management_plan;
        plantTasksByManagementPlanIdEntities[management_plan_id] = plantTask;
        return plantTasksByManagementPlanIdEntities;
      },
      {},
    );
  },
);

export const plantTaskStatusSelector = createSelector(
  [plantTaskReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
