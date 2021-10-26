import { createSelector } from 'reselect';
import { tasksByManagementPlanIdSelector, tasksSelector } from '../taskSlice';
import i18n from '../../locales/i18n';
import { isTaskType } from './useIsTaskType';
import { getTaskCardDate } from '../../util/moment';
import { loginSelector, userFarmEntitiesSelector } from '../userFarmSlice';
import { getLocationName } from '../Crop/CropManagement/useManagementPlanCardContents';

const getTaskContents = (tasks, userFarmEntities, { farm_id }) => {
  return tasks
    .sort((taskA, taskB) => {
      if (
        !taskA.completed_time &&
        !taskA.abandoned_time &&
        (taskB.completed_time || taskB.abandoned_time)
      ) {
        return -1;
      }
      if (
        taskA.completed_time &&
        !taskA.abandoned_time &&
        !taskB.completed_time &&
        taskB.abandoned_time
      ) {
        return -1;
      }
      if (
        !taskA.completed_time &&
        !taskA.abandoned_time &&
        !taskB.completed_time &&
        !taskB.abandoned_time
      ) {
        return new Date(taskA.due_date).getTime() - new Date(taskB.due_date).getTime();
      }
      if (taskA.completed_time && taskB.completed_time) {
        return new Date(taskA.completed_time).getTime() - new Date(taskB.completed_time).getTime();
      }
      if (taskA.abandoned_time && taskB.abandoned_time) {
        return new Date(taskA.abandoned_time).getTime() - new Date(taskB.abandoned_time).getTime();
      }
      return 1;
    })
    .map((task) => {
      const managementPlans = task.managementPlans;
      return {
        task_id: task.task_id,
        taskType: task.taskType,
        status: getTaskStatus(task),
        cropVarietyNames: getCropVarietyName(managementPlans),
        locationName: getLocationNameOfTask(managementPlans, task.locations, task.taskType),
        completeOrDueDate: getTaskCardDate(task.completed_time || task.due_date),
        assignee: userFarmEntities[farm_id][task.assignee_user_id],
        happiness: task.happiness,
        abandoned_time: task.abandoned_time,
      };
    });
};

export const taskCardContentSelector = createSelector(
  [tasksSelector, userFarmEntitiesSelector, loginSelector],
  getTaskContents,
);

export const taskCardContentByManagementPlanSelector = (management_plan_id) =>
  createSelector(
    [tasksByManagementPlanIdSelector(management_plan_id), userFarmEntitiesSelector, loginSelector],
    getTaskContents,
  );

export const getTaskStatus = (task) => {
  if (task.completed_time) return 'completed';
  if (task.abandoned_time) return 'abandoned';
  if (new Date(task.due_date) > Date.now()) return 'planned';
  return 'late';
};

const getCropVarietyName = (managementPlans) => {
  const cropVarietyNameSet = new Set();
  for (const managementPlan of managementPlans) {
    const cropVarietyName = managementPlan.crop_variety.crop_variety_name;
    cropVarietyNameSet.add(cropVarietyName);
    if (cropVarietyNameSet.size > 1) return i18n.t('TASK.CARD.MULTIPLE_CROPS');
  }
  return cropVarietyNameSet.values()[0];
};

const getLocationNameOfTask = (managementPlans, locations, taskType) => {
  if (isTaskType(taskType, 'TRANSPLANT_TASK'))
    return getLocationNameOfTransplantTask(managementPlans);
  if (isTaskType(taskType, 'PLANT_TASK')) return getLocationNameOfPlantTask(managementPlans);
  const locationNameSet = new Set();
  for (const managementPlan of managementPlans) {
    const locationNameName = getLocationName(managementPlan.planting_management_plan);
    locationNameSet.add(locationNameName);
    if (locationNameSet.size > 1) return i18n.t('TASK.CARD.MULTIPLE_LOCATIONS');
  }
  for (const location of locations) {
    const locationNameName = location.name;
    locationNameSet.add(locationNameName);
    if (locationNameSet.size > 1) return i18n.t('TASK.CARD.MULTIPLE_LOCATIONS');
  }

  return locationNameSet.values()?.next()?.value;
};

const getLocationNameOfTransplantTask = (managementPlans) => {
  return getLocationName(managementPlans[0].planting_management_plan);
};

const getLocationNameOfPlantTask = (managementPlans) => {
  return getLocationName(managementPlans[0].planting_management_plan);
};
