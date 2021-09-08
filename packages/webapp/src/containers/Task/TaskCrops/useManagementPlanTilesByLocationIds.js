import { useSelector } from 'react-redux';
import {
  filterManagementPlansByLocationId,
  isCurrentManagementPlan,
  isPlannedManagementPlan,
  managementPlanEntitiesSelector,
  managementPlansSelector,
} from '../../managementPlanSlice';
import { useMemo } from 'react';
import { taskEntitiesByManagementPlanIdSelector } from '../../taskSlice';
import { getTasksMinMaxDate } from '../getTasksMinMaxDate';
import produce from 'immer';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { getDateUTC } from '../../../util/moment';

export const useManagementPlanTilesByLocationIds = (locationIds = [], managementPlanIds) => {
  const managementPlanEntities = useSelector(managementPlanEntitiesSelector);
  const managementPlans = managementPlanIds
    ? managementPlanIds.map((management_plan_id) => managementPlanEntities[management_plan_id])
    : Object.values(managementPlanEntities);

  const tasksByManagementPlanId = useSelector(taskEntitiesByManagementPlanIdSelector);
  return useMemo(
    () =>
      locationIds.reduce((managementPlansByLocationIds, { location_id }) => {
        const filteredManagementPlans = filterManagementPlansByLocationId(
          location_id,
          managementPlans,
        ).map((managementPlan) => {
          return produce(managementPlan, (managementPlan) => {
            const tasks = tasksByManagementPlanId[managementPlan.management_plan_id];
            managementPlan.firstTaskDate = getTasksMinMaxDate(tasks).startDate;
            managementPlan.status = managementPlan.start_date ? 'active' : 'planned';
          });
        });
        return filteredManagementPlans.length
          ? {
              ...managementPlansByLocationIds,
              [location_id]: filteredManagementPlans,
            }
          : { ...managementPlansByLocationIds };
      }, {}),
    [locationIds, managementPlans],
  );
};

export const useActiveAndCurrentManagementPlanTilesByLocationIds = (locationIds = []) => {
  const activeAndPlanedManagementPlanIds = useActiveAndCurrentManagementPlansByTaskDate();
  return useManagementPlanTilesByLocationIds(locationIds, activeAndPlanedManagementPlanIds);
};

const useActiveAndCurrentManagementPlansByTaskDate = () => {
  const { due_date } = useSelector(hookFormPersistSelector);
  const utcDate = getDateUTC(due_date);
  const managementPlans = useSelector(managementPlansSelector);
  return useMemo(
    () =>
      managementPlans
        .filter(
          (managementPlan) =>
            isCurrentManagementPlan(managementPlan, utcDate) ||
            isPlannedManagementPlan(managementPlan, utcDate),
        )
        .map(({ management_plan_id }) => management_plan_id),
    [due_date],
  );
};
