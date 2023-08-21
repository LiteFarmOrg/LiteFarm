/*
 *  Copyright 2023 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */
import { createSelector } from 'reselect';
// eslint-disable-next-line
import { sortTasks } from '../../../../../libs/domain/tasks/src';
import { tasksByManagementPlanIdSelector, tasksSelector } from '../taskSlice';
import i18n from '../../locales/i18n';
import { isTaskType } from './useIsTaskType';
import { getTaskCardDate } from '../../util/moment';
import { loginSelector, userFarmEntitiesSelector } from '../userFarmSlice';
import { getLocationName } from '../Crop/CropManagement/useManagementPlanCardContents';
import { tasksFilterSelector } from '../filterSlice';
import { filterTasks } from './tasksFilter';
import { IS_ASCENDING } from '../Filter/constants';

const getTaskContents = (tasks, userFarmEntities, { farm_id }) => {
  return tasks.map((task) => {
    const managementPlans = task.managementPlans;
    return {
      task_id: task.task_id,
      taskType: task.taskType,
      status: getTaskStatus(task),
      pinned: task.pinned,
      cropVarietyName: getCropVarietyName(managementPlans),
      locationName: getLocationNameOfTask(
        managementPlans,
        task.locations,
        task.taskType
      ),
      completeOrDueDate: getTaskCardDate(task.complete_date || task.due_date),
      assignee: task.assignee,
      happiness: task.happiness,
      abandon_date: task.abandon_date,
      date: task.abandon_date || task.complete_date || task.due_date,
      wage_at_moment: task.wage_at_moment,
    };
  });
};

export const taskCardContentSelector = createSelector(
  [tasksSelector, userFarmEntitiesSelector, loginSelector],
  getTaskContents
);

export const manualFilteredTaskCardContentSelector = (filter) =>
  createSelector(
    [tasksSelector, userFarmEntitiesSelector, loginSelector],
    (tasks, userFarmEntities, userFarm) =>
      getTaskContents(filter(tasks), userFarmEntities, userFarm)
  );

export const filteredTaskCardContentSelector = createSelector(
  [tasksSelector, tasksFilterSelector, userFarmEntitiesSelector, loginSelector],
  (tasks, filters, userFarmEntities, userFarm) =>
    sortTasks(
      getTaskContents(filterTasks(tasks, filters), userFarmEntities, userFarm),
      filters[IS_ASCENDING]
    )
);

export const taskCardContentByManagementPlanSelector = (management_plan_id) =>
  createSelector(
    [
      tasksByManagementPlanIdSelector(management_plan_id),
      userFarmEntitiesSelector,
      loginSelector,
    ],
    (tasks, userFarmEntities, { farm_id }) =>
      sortTasks(getTaskContents(tasks, userFarmEntities, { farm_id }))
  );

export const getTaskStatus = (task) => {
  if (task.complete_date) return 'completed';
  if (task.abandon_date) return 'abandoned';
  if (new Date(task.due_date) >= new Date().setHours(0, 0, 0, 0))
    return 'planned';
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
  if (isTaskType(taskType, 'PLANT_TASK'))
    return getLocationNameOfPlantTask(managementPlans);
  const locationNameSet = new Set();
  for (const managementPlan of managementPlans) {
    const locationNameName = getLocationName(
      managementPlan.planting_management_plan
    );
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
