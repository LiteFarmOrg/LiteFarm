import { createSelector } from 'reselect';
import {
  getCurrentManagementPlans,
  getExpiredManagementPlans,
  getPlannedManagementPlans,
  isCurrentManagementPlan,
  isPlannedManagementPlan,
  managementPlansSelector,
} from '../../managementPlanSlice';
import { taskEntitiesSelector } from '../../taskSlice';
import { plantTasksByManagementPlanIdEntitiesSelector } from '../../slice/taskSlice/plantTaskSlice';
import { transplantTasksByManagementPlanIdEntitiesSelector } from '../../slice/taskSlice/transplantTaskSlice';
import produce from 'immer';
import { lastActiveDatetimeSelector } from '../../userLogSlice';
import { plantingManagementPlanEntitiesByManagementPlanIdSelector } from '../../plantingManagementPlanSlice';
//TODO: remember current planting_management_plan/location on database level instead of selector
export const managementPlansWithCurrentLocationSelector = createSelector(
  [
    managementPlansSelector,
    transplantTasksByManagementPlanIdEntitiesSelector,
    plantTasksByManagementPlanIdEntitiesSelector,
    taskEntitiesSelector,
    plantingManagementPlanEntitiesByManagementPlanIdSelector,
  ],
  (
    managementPlans,
    transplantTasksByManagementPlanId,
    plantTasksByManagementPlanId,
    taskEntities,
    plantingManagementPlanByManagementPlanEntities,
  ) => {
    //TODO: add location history table and remove try catch block LF-2088
    try {
      return produce(managementPlans, (managementPlans) => {
        for (const index in managementPlans) {
          const { management_plan_id } = managementPlans[index];
          const transplantTasks = transplantTasksByManagementPlanId[management_plan_id] || [];
          let latestCompletedTime;
          for (const transplantTask of transplantTasks) {
            const { complete_date } = taskEntities[transplantTask.task_id];
            const completedTimeInNumericalTime = complete_date && new Date(complete_date).getTime();
            if (
              completedTimeInNumericalTime &&
              (!latestCompletedTime || completedTimeInNumericalTime > latestCompletedTime)
            ) {
              latestCompletedTime = completedTimeInNumericalTime;
              managementPlans[index].location = transplantTask.planting_management_plan.location;
              managementPlans[index].planting_management_plan =
                transplantTask.planting_management_plan;
            }
          }
          if (!latestCompletedTime) {
            const plant_task = plantTasksByManagementPlanId[management_plan_id];
            if (plant_task) {
              managementPlans[index].location = plant_task.planting_management_plan.location;
              managementPlans[index].planting_management_plan = plant_task.planting_management_plan;
            } else {
              //In ground wild crop location and planting method
              const planting_management_plan = plantingManagementPlanByManagementPlanEntities[
                management_plan_id
              ]?.find(
                (planting_management_plan) =>
                  !transplantTasksByManagementPlanId[management_plan_id]?.find?.(
                    (transplantTask) =>
                      planting_management_plan.planting_management_plan_id ===
                      transplantTask.planting_management_plan_id,
                  ),
              );
              managementPlans[index].pin_coordinate = planting_management_plan?.pin_coordinate;
              managementPlans[index].location = planting_management_plan?.location;
              managementPlans[index].planting_management_plan = planting_management_plan;
            }
          }
        }
      });
    } catch (e) {
      return [];
    }
  },
);

export const managementPlanWithCurrentLocationEntitiesSelector = createSelector(
  [managementPlansWithCurrentLocationSelector],
  (managementPlansWithCurrentLocation) =>
    managementPlansWithCurrentLocation.reduce((entities, managementPlan) => {
      entities[managementPlan.management_plan_id] = managementPlan;
      return entities;
    }, {}),
);

export const managementPlansByCurrentLocationEntitiesSelector = createSelector(
  [managementPlansWithCurrentLocationSelector],
  (managementPlansWithCurrentLocation) =>
    managementPlansWithCurrentLocation.reduce((entities, managementPlan) => {
      const location_id = managementPlan?.location?.location_id;
      if (location_id) {
        if (!entities[location_id]) entities[location_id] = [];
        entities[location_id].push(managementPlan);
      }
      return entities;
    }, {}),
);

export const filterManagementPlansByLocationId = (location_id, managementPlans) =>
  managementPlans.filter((managementPlan) => managementPlan.location?.location_id === location_id);

const getLocationsFromManagementPlans = (managementPlansWithCurrentLocation) => {
  const locationEntitiesWithManagementPlans = {};
  for (const managementPlan of managementPlansWithCurrentLocation) {
    const location_id = managementPlan.location?.location_id;
    if (location_id && !locationEntitiesWithManagementPlans.hasOwnProperty(location_id)) {
      locationEntitiesWithManagementPlans[location_id] = managementPlan.location;
    }
  }
  return Object.values(locationEntitiesWithManagementPlans);
};

export const locationsWithManagementPlanSelector = createSelector(
  [managementPlansWithCurrentLocationSelector],
  getLocationsFromManagementPlans,
);

export const locationsWithCurrentAndPlannedManagementPlanSelector = createSelector(
  [managementPlansWithCurrentLocationSelector],
  (managementPlans) =>
    getLocationsFromManagementPlans(
      managementPlans.filter(
        (managementPlan) =>
          isCurrentManagementPlan(managementPlan) || isPlannedManagementPlan(managementPlan),
      ),
    ),
);

export const expiredManagementPlansByLocationIdSelector = (location_id) =>
  createSelector(
    [() => location_id, managementPlansWithCurrentLocationSelector, lastActiveDatetimeSelector],
    (location_id, managementPlans, lastActiveDatetime) =>
      getExpiredManagementPlans(
        filterManagementPlansByLocationId(location_id, managementPlans),
        lastActiveDatetime,
      ),
  );

export const currentManagementPlansByLocationIdSelector = (location_id) =>
  createSelector(
    [() => location_id, managementPlansWithCurrentLocationSelector, lastActiveDatetimeSelector],
    (location_id, managementPlans, lastActiveDatetime) =>
      getCurrentManagementPlans(
        filterManagementPlansByLocationId(location_id, managementPlans),
        lastActiveDatetime,
      ),
  );
export const plannedManagementPlansByLocationIdSelector = (location_id) =>
  createSelector(
    [() => location_id, managementPlansWithCurrentLocationSelector, lastActiveDatetimeSelector],
    (location_id, managementPlans, lastActiveDatetime) =>
      getPlannedManagementPlans(
        filterManagementPlansByLocationId(location_id, managementPlans),
        lastActiveDatetime,
      ),
  );

export const currentAndPlannedManagementPlansByLocationIdSelector = (location_id) =>
  createSelector(
    [
      plannedManagementPlansByLocationIdSelector(location_id),
      currentManagementPlansByLocationIdSelector(location_id),
    ],
    (plannedManagementPlans, currentManagementPlans) => [
      ...plannedManagementPlans,
      ...currentManagementPlans,
    ],
  );

export const managementPlansWithCurrentLocationByCropIdSelector = (cropId) =>
  createSelector([managementPlansWithCurrentLocationSelector], (managementPlans) =>
    managementPlans.filter((m) => m.crop_id === cropId),
  );
