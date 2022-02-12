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
        !taskA.complete_date &&
        !taskA.abandon_date &&
        (taskB.complete_date || taskB.abandon_date)
      ) {
        return -1;
      }
      if (
        taskA.complete_date &&
        !taskA.abandon_date &&
        !taskB.complete_date &&
        taskB.abandon_date
      ) {
        return -1;
      }
      if (
        !taskA.complete_date &&
        !taskA.abandon_date &&
        !taskB.complete_date &&
        !taskB.abandon_date
      ) {
        return new Date(taskA.due_date).getTime() - new Date(taskB.due_date).getTime();
      }
      if (taskA.complete_date && taskB.complete_date) {
        return new Date(taskA.complete_date).getTime() - new Date(taskB.complete_date).getTime();
      }
      if (taskA.abandon_date && taskB.abandon_date) {
        return new Date(taskA.abandon_date).getTime() - new Date(taskB.abandon_date).getTime();
      }
      return 1;
    })
    .map((task) => {
      const managementPlans = task.managementPlans;
      return {
        task_id: task.task_id,
        taskType: task.taskType,
        status: getTaskStatus(task),
        cropVarietyName: getCropVarietyName(managementPlans),
        locationName: getLocationNameOfTask(managementPlans, task.locations, task.taskType),
        completeOrDueDate: getTaskCardDate(task.complete_date || task.due_date),
        assignee: userFarmEntities[farm_id][task.assignee_user_id],
        happiness: task.happiness,
        abandon_date: task.abandon_date,
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
  if (task.complete_date) return 'completed';
  if (task.abandon_date) return 'abandoned';
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
  // get first element of set
  return cropVarietyNameSet.values()?.next()?.value;
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
