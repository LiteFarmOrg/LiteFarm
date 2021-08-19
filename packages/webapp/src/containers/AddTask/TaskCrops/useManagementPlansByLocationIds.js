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
      locationIds.reduce((managementPlansByLocationIds, { location_id }) => {
        const filteredManagementPlans = filterManagementPlansByLocationId(
          location_id,
          managementPlans,
        );
        return filteredManagementPlans.length ? {
          ...managementPlansByLocationIds,
          [location_id]: filteredManagementPlans
        } : { ...managementPlansByLocationIds};
      }, {}),
    [locationIds, managementPlans],
  );
};
