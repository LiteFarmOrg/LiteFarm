import { useSelector } from 'react-redux';
import { managementPlansWithCurrentLocationSelector } from './TaskCrops/managementPlansWithLocationSelector';
import { useMemo } from 'react';

export const useReadOnlyPinCoordinates = () => {
  const managementPlans = useSelector(managementPlansWithCurrentLocationSelector);
  return useMemo(
    () =>
      managementPlans
        .map((managementPlan) => managementPlan.planting_management_plan.pin_coordinate)
        .filter((pin_coordinate) => pin_coordinate),
    [],
  );
};
