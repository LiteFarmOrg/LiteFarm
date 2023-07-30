import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import {
  loginSelector,
  onLoadingFail,
  onLoadingStart,
  userFarmEntitiesSelector,
} from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util/pick';
import { managementPlanEntitiesSelector } from './managementPlanSlice';
import { productsSelector } from './productSlice';
import { locationEntitiesSelector } from './locationSlice';
import { cleaningTaskEntitiesSelector } from './slice/taskSlice/cleaningTaskSlice';
import { fieldWorkTaskEntitiesSelector } from './slice/taskSlice/fieldWorkTaskSlice';
import { harvestTaskEntitiesSelector } from './slice/taskSlice/harvestTaskSlice';
import { pestControlTaskEntitiesSelector } from './slice/taskSlice/pestControlTaskSlice';
import { soilAmendmentTaskEntitiesSelector } from './slice/taskSlice/soilAmendmentTaskSlice';
import produce from 'immer';
import { taskTypeEntitiesSelector } from './taskTypeSlice';
import { plantTaskEntitiesSelector } from './slice/taskSlice/plantTaskSlice';
import { transplantTaskEntitiesSelector } from './slice/taskSlice/transplantTaskSlice';
import { plantingManagementPlanEntitiesSelector } from './plantingManagementPlanSlice';
import { irrigationTaskEntitiesSelector } from './slice/taskSlice/irrigationTaskSlice';

export const getTask = (obj) => {
  const task = pick(obj, [
    'task_id',
    'due_date',
    'owner_user_id',
    'notes',
    'completion_notes',
    'owner_user_id',
    'task_type_id',
    'assignee_user_id',
    'coordinates',
    'duration',
    'wage_at_moment',
    'happiness',
    'complete_date',
    'late_time',
    'for_review_time',
    'abandon_date',
    'locations',
    'managementPlans',
    'abandonment_reason',
    'other_abandonment_reason',
    'abandonment_notes',
    'location_defaults',
  ]);
  //TODO: investigate why incomplete tasks wage_at_moment are null
  if (task.wage_at_moment === null) task.wage_at_moment = 0;
  return task;
};

const upsertManyTasks = (state, { payload: tasks }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  taskAdapter.setAll(
    state,
    tasks.map((task) => getTask(task)),
  );
};

const upsertOneTask = (state, { payload: task }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  taskAdapter.upsertOne(state, task);
};

const updateManyTasks = (state, { payload: tasks }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  taskAdapter.updateMany(state, tasks);
};

const removeOne = (state, { payload: task }) => {
  const { task_id } = task;
  state.loading = false;
  state.error = null;
  state.loaded = true;
  taskAdapter.removeOne(state, task_id);
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
    addManyTasksFromGetReq: (state, { payload: tasks }) =>
      upsertManyTasks(state, {
        payload: tasks.map((task) => ({
          ...task,
          locations: task.locations?.map(({ location_id }) => location_id) || [],
          location_defaults:
            task.locations?.map(({ location_defaults }) => location_defaults) || [],
          managementPlans:
            task.managementPlans?.map(({ management_plan_id, planting_management_plan_id }) => ({
              management_plan_id,
              planting_management_plan_id,
            })) || [],
        })),
      }),
    putTaskSuccess: upsertOneTask,
    putTasksSuccess: updateManyTasks,
    createTaskSuccess: taskAdapter.addOne,
    deleteTaskSuccess: removeOne,
  },
});
export const {
  onLoadingTasksFail,
  onLoadingTasksStart,
  addManyTasksFromGetReq,
  putTaskSuccess,
  putTasksSuccess,
  createTaskSuccess,
  deleteTaskSuccess,
} = taskSlice.actions;
export default taskSlice.reducer;

export const taskReducerSelector = (state) => state.entitiesReducer[taskSlice.name];
export const taskSelectors = taskAdapter.getSelectors(
  (state) => state.entitiesReducer[taskSlice.name],
);

//TODO: refactor
export const taskEntitiesSelector = createSelector(
  [
    userFarmEntitiesSelector,
    loginSelector,
    taskSelectors.selectEntities,
    taskTypeEntitiesSelector,
    managementPlanEntitiesSelector,
    locationEntitiesSelector,
    cleaningTaskEntitiesSelector,
    fieldWorkTaskEntitiesSelector,
    irrigationTaskEntitiesSelector,
    harvestTaskEntitiesSelector,
    pestControlTaskEntitiesSelector,
    soilAmendmentTaskEntitiesSelector,
    plantTaskEntitiesSelector,
    transplantTaskEntitiesSelector,
    plantingManagementPlanEntitiesSelector,
  ],
  (
    userFarmEntities,
    userFarm,
    taskEntities,
    taskTypeEntities,
    managementPlanEntities,
    locationEntities,
    cleaningTaskEntities,
    fieldWorkTaskEntities,
    irrigationTaskEntities,
    harvestTaskEntities,
    pestControlTaskEntities,
    soilAmendmentTaskEntities,
    plantTaskEntities,
    transplantTaskEntities,
    plantingManagementPlanEntities,
  ) => {
    const subTaskEntities = {
      ...cleaningTaskEntities,
      ...fieldWorkTaskEntities,
      ...irrigationTaskEntities,
      ...harvestTaskEntities,
      ...pestControlTaskEntities,
      ...soilAmendmentTaskEntities,
      ...plantTaskEntities,
      ...transplantTaskEntities,
    };

    const getManagementPlanByPlantingManagementPlan = ({
      planting_management_plan_id,
      planting_management_plan,
      prev_planting_management_plan,
    }) => {
      const management_plan_id =
        plantingManagementPlanEntities[planting_management_plan_id]?.management_plan_id;
      return produce(managementPlanEntities[management_plan_id], (managementPlan) => {
        if (!managementPlan) {
          return {};
        }
        managementPlan.planting_management_plan =
          plantingManagementPlanEntities[planting_management_plan_id];
        prev_planting_management_plan &&
          (managementPlan.prev_planting_management_plan = prev_planting_management_plan);
      });
    };

    return produce(taskEntities, (taskEntities) => {
      for (const task_id in taskEntities) {
        taskEntities[task_id].managementPlans =
          taskEntities[task_id].managementPlans?.map(getManagementPlanByPlantingManagementPlan) ||
          [];
        taskEntities[task_id].locations =
          taskEntities[task_id].locations?.map((location_id) => locationEntities[location_id]) ||
          [];
        const taskType = taskTypeEntities[taskEntities[task_id].task_type_id];
        taskEntities[task_id].taskType = taskType;
        const { task_translation_key, farm_id } = taskType;
        const subtask = subTaskEntities[task_id];
        !farm_id && (taskEntities[task_id][task_translation_key.toLowerCase()] = subtask);
        if (!farm_id && ['PLANT_TASK', 'TRANSPLANT_TASK'].includes(task_translation_key)) {
          taskEntities[task_id].locations = subtask.planting_management_plan.location_id
            ? [locationEntities[subtask.planting_management_plan.location_id]]
            : [];
          taskEntities[task_id].managementPlans = [
            getManagementPlanByPlantingManagementPlan(subtask),
          ];
        }
        taskEntities[task_id].assignee =
          userFarmEntities[userFarm.farm_id][taskEntities[task_id].assignee_user_id];
      }
    });
  },
);

export const tasksSelector = createSelector(
  [taskEntitiesSelector, loginSelector],
  (taskEntities, { farm_id }) => {
    return Object.values(taskEntities).filter(({ locations, managementPlans, taskType }) => {
      for (const location of locations) {
        if (location.farm_id === farm_id) {
          return true;
        }
      }
      for (const managementPlan of managementPlans) {
        if (managementPlan.farm_id === farm_id) {
          return true;
        }
      }
      if (taskType.farm_id === farm_id) {
        return true;
      }
      return false;
    });
  },
);

const getTaskEntitiesByManagementPlanId = (tasks) => {
  return tasks.reduce((obj, task) => {
    const { managementPlans } = task;
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
    (taskEntitiesByManagementPlanId) => taskEntitiesByManagementPlanId[management_plan_id] || [],
  );

export const taskSelector = (task_id) => (state) => taskEntitiesSelector(state)[task_id];

export const getPendingTasks = (tasks) =>
  tasks.filter((task) => !task.abandon_date && !task.complete_date);

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
  tasks.filter((task) => !task.abandon_date && task.complete_date);

export const completedTasksSelector = createSelector([tasksSelector], getCompletedTasks);

export const getAbandonedTasks = (tasks) => tasks.filter((task) => task.abandon_date);

export const abandonedTasksSelector = createSelector([tasksSelector], getAbandonedTasks);

export const taskWithProductSelector = (task_id) =>
  createSelector([taskSelector(task_id), productsSelector], (task, products) => {
    if (task === undefined) return undefined;
    const taskTypeLowerCase = task.taskType.task_translation_key.toLowerCase();
    const taskHasProduct = !!task[taskTypeLowerCase]?.product_id;
    if (taskHasProduct) {
      const product = products.find(
        ({ product_id }) => task[taskTypeLowerCase].product_id === product_id,
      );
      return {
        ...task,
        [taskTypeLowerCase]: {
          product: { ...product },
          ...task[[taskTypeLowerCase]],
        },
      };
    }
    return task;
  });
