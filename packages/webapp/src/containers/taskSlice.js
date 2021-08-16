import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util/pick';

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
} = taskSlice.actions;
export default taskSlice.reducer;

export const taskReducerSelector = (state) => state.entitiesReducer[taskSlice.name];

export const taskSelectors = taskAdapter.getSelectors(
  (state) => state.entitiesReducer[taskSlice.name],
);

export const taskEntitiesSelector = createSelector(taskReducerSelector, ({ ids, entities }) => {
  return ids.map((id) => entities[id]);
});

export const taskSelectorById = (task_id) => (state) => taskSelectors.selectById(state, task_id);

export const taskEntitiesSelectorByManagementPlanId = createSelector(
  [taskEntitiesSelector],
  (tasks) => {
    return tasks.reduce((obj, { managementPlans, ...task }) => {
      let newObj = { ...obj };
      managementPlans.forEach(({ management_plan_id }) => {
        if (!newObj[management_plan_id]) {
          newObj[management_plan_id] = [task];
        } else {
          newObj[management_plan_id].push(task);
        }
      });
      return newObj;
    }, {});
  },
);
