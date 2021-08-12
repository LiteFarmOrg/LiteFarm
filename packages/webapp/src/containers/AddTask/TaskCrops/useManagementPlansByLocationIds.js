import { useSelector } from 'react-redux';
import {
  filterManagementPlansByLocationId,
  managementPlansSelector,
} from '../../managementPlanSlice';
import { useMemo } from 'react';

export const useManagementPlansByLocationIds = (locationIds = []) => {
  const managementPlans = useSelector(managementPlansSelector);
  return useMemo(
    () =>
      locationIds.reduce((managementPlansByLocationIds, location_id) => {
        managementPlansByLocationIds[location_id] = filterManagementPlansByLocationId(
          location_id,
          managementPlans,
        );
        return managementPlansByLocationIds;
      }, {}),
    [locationIds, managementPlans],
  );
};
