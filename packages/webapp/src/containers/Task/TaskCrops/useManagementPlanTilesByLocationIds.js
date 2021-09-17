import { useSelector } from 'react-redux';
import { currentAndPlannedManagementPlansSelector } from '../../managementPlanSlice';
import { useMemo } from 'react';
import { taskEntitiesByManagementPlanIdSelector } from '../../taskSlice';
import { getTasksMinMaxDate } from '../getTasksMinMaxDate';
import produce from 'immer';
import { managementPlanWithCurrentLocationEntitiesSelector } from './managementPlansWithLocationSelector';
import { plantingManagementPlanEntitiesByManagementPlanIdSelector } from '../../plantingManagementPlanSlice';

export const useManagementPlanTilesByLocationIds = (locationIds = [], managementPlanIds = []) => {
  const tasksByManagementPlanId = useSelector(taskEntitiesByManagementPlanIdSelector);
  const managementPlanEntities = useSelector(managementPlanWithCurrentLocationEntitiesSelector);
  const plantingManagementPlanEntitiesByManagementPlanId = useSelector(
    plantingManagementPlanEntitiesByManagementPlanIdSelector,
  );
  return useMemo(
    () =>
      managementPlanIds.reduce((managementPlansByLocationIds, management_plan_id) => {
        const managementPlan = managementPlanEntities[management_plan_id];
        const { location_id } =
          locationIds.find(({ location_id }) => {
            if (managementPlan?.location?.location_id === location_id) {
              return true;
            }
            for (const { location } of plantingManagementPlanEntitiesByManagementPlanId[
              management_plan_id
            ]) {
              if (location?.location_id === location_id) return true;
            }
            return false;
          }) || {};
        if (location_id) {
          if (!managementPlansByLocationIds[location_id])
            managementPlansByLocationIds[location_id] = [];
          managementPlansByLocationIds[location_id].push(
            produce(managementPlan, (managementPlan) => {
              const tasks = tasksByManagementPlanId[managementPlan.management_plan_id];
              managementPlan.firstTaskDate = getTasksMinMaxDate(tasks).startDate;
              managementPlan.status = managementPlan.start_date ? 'active' : 'planned';
            }),
          );
        }
        return managementPlansByLocationIds;
      }, {}),
    [locationIds, managementPlanIds],
  );
};

export const useActiveAndCurrentManagementPlanTilesByLocationIds = (locationIds = []) => {
  const managementPlans = useSelector(currentAndPlannedManagementPlansSelector);
  return useManagementPlanTilesByLocationIds(
    locationIds,
    managementPlans.map(({ management_plan_id }) => management_plan_id),
  );
};
