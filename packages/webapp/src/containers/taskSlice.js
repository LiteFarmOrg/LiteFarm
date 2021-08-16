import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util/pick';
import { managementPlanEntitiesSelector } from './managementPlanSlice';

export const getTask = (obj) => {
  return pick(obj, [
    'task_id',
    'due_date',
    'owner_user_id',
    'notes',
    'completion_notes',
    'owner_user_id',
    'taskType',
    'type',
    'assignee_user_id',
    'coordinates',
    'duration',
    'wage_at_moment',
    'happiness',
    'planned_time',
    'completed_time',
    'late_time',
    'for_review_time',
    'abandoned_time',
    'locations',
    'managementPlans',
  ]);
};

const addManyTasks = (state, { payload: tasks }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  taskAdapter.upsertMany(
    state,
    tasks.map((task) => getTask(task)),
  );
};

const updateOneTask = (state, { payload: task }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  taskAdapter.updateOne(state, task);
};

const updateManyTasks = (state, { payload: tasks }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  taskAdapter.updateMany(state, tasks);
};

const taskAdapter = createEntityAdapter({
  selectId: (task) => task.task_id,
});

const taskSlice = createSlice({
  name: 'taskReducer',
  initialState: taskAdapter.getInitialState({
    loading: false,
    error: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingTasksStart: onLoadingStart,
    onLoadingTasksFail: onLoadingFail,
    getTasksSuccess: addManyTasks,
    putTaskSuccess: updateOneTask,
    putTasksSuccess: updateManyTasks,
    createTaskSuccess: taskAdapter.addOne,
    deleteTaskSuccess: taskAdapter.removeOne,
  },
});
export const {
  onLoadingTasksFail,
  onLoadingTasksStart,
  getTasksSuccess,
  putTaskSuccess,
  putTasksSuccess,
  deleteTaskSuccess,
  createTaskSuccess,
} = taskSlice.actions;
export default taskSlice.reducer;

export const taskReducerSelector = (state) => state.entitiesReducer[taskSlice.name];
export const taskSelectors = taskAdapter.getSelectors(
  (state) => state.entitiesReducer[taskSlice.name],
);

export const taskEntitiesSelector = taskSelectors.selectEntities;

export const tasksSelector = createSelector(
  [taskSelectors.selectAll, loginSelector, managementPlanEntitiesSelector],
  (tasks, { farm_id }, managementPlanEntities) => {
    return tasks.filter(({ locations, managementPlans }) => {
      for (const location of locations) {
        if (location.farm_id === farm_id) {
          return true;
        }
      }
      for (const { management_plan_id } of managementPlans) {
        if (managementPlanEntities[management_plan_id].farm_id === farm_id) {
          return true;
        }
      }
      return false;
    });
  },
);

export const taskSelectorById = (task_id) => (state) => taskSelectors.selectById(state, task_id);
