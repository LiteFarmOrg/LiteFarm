import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util/pick';
import { managementPlanEntitiesSelector } from './managementPlanSlice';
import { productEntitiesSelector } from './productSlice';

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
    'abandonment_reason',
    'other_abandonment_reason',
    'abandonment_notes',
    'soil_amendment_task',
    'pest_control_task',
    'field_work_task',
    'cleaning_task',
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

const getTaskEntitiesByManagementPlanId = (tasks) => {
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
};

export const taskEntitiesByManagementPlanIdSelector = createSelector(
  [tasksSelector],
  getTaskEntitiesByManagementPlanId,
);

export const tasksByManagementPlanIdSelector = (management_plan_id) =>
  createSelector(
    taskEntitiesByManagementPlanIdSelector,
    (taskEntitiesByManagementPlanId) => taskEntitiesByManagementPlanId[management_plan_id],
  );

export const taskSelectorById = (task_id) => (state) => taskSelectors.selectById(state, task_id);

export const getPendingTasks = (tasks) =>
  tasks.filter((task) => !task.abandoned_time && !task.completed_time);

export const pendingTasksSelector = createSelector([tasksSelector], getPendingTasks);

export const pendingTaskEntitiesByManagementPlanIdSelector = createSelector(
  [pendingTasksSelector],
  getTaskEntitiesByManagementPlanId,
);

export const pendingTasksByManagementPlanIdSelector = (management_plan_id) =>
  createSelector(
    [pendingTaskEntitiesByManagementPlanIdSelector],
    (tasksByManagementPlanId) => tasksByManagementPlanId[management_plan_id] || [],
  );

export const getCompletedTasks = (tasks) =>
  tasks.filter((task) => !task.abandoned_time && task.completed_time);

export const completedTasksSelector = createSelector([tasksSelector], getCompletedTasks);

export const getAbandonedTasks = (tasks) => tasks.filter((task) => task.abandoned_time);

export const abandonedTasksSelector = createSelector([tasksSelector], getAbandonedTasks);

export const taskWithProductById = (task_id) =>
  createSelector([taskSelectorById(task_id), productEntitiesSelector], (task, products) => {
    const taskTypeKey = {
      CLEANING: 'cleaning_task',
      PEST_CONTROL: 'pest_control_task',
      SOIL_AMENDMENT: 'soil_amendment_task',
    };
    const taskHasProduct = !!task[taskTypeKey[task.taskType[0].task_translation_key]]?.product_id;
    if (taskHasProduct) {
      const product = products.find(
        ({ product_id }) =>
          task[taskTypeKey[task.taskType[0].task_translation_key]].product_id === product_id,
      );
      return {
        ...task,
        [taskTypeKey[task.taskType[0].task_translation_key]]: {
          product: { ...product },
          ...task[[taskTypeKey[task.taskType[0].task_translation_key]]],
        },
      };
    }
    return task;
  });
