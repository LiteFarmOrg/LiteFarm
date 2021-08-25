import { useSelector } from 'react-redux';
import {
  filterManagementPlansByLocationId,
  managementPlansSelector,
  currentAndPlannedManagementPlansSelector,
} from '../../managementPlanSlice';
import { useMemo } from 'react';

export const useManagementPlansByLocationIds = (locationIds = []) => {
  const managementPlans = useSelector(managementPlansSelector);
  return useMemo(
    () =>
      locationIds.reduce((managementPlansByLocationIds, { location_id }) => {
        const filteredManagementPlans = filterManagementPlansByLocationId(
          location_id,
          managementPlans,
        );
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

export const useActiveAndCurrentManagementPlansByLocationIds = (locationIds = []) => {
  const managementPlans = useSelector(currentAndPlannedManagementPlansSelector);
  return useMemo(
    () =>
      locationIds.reduce((managementPlansByLocationIds, { location_id }) => {
        const filteredManagementPlans = filterManagementPlansByLocationId(
          location_id,
          managementPlans,
        );
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
