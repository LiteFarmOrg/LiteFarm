import { useSelector } from 'react-redux';
import { managementPlanWithCurrentLocationEntitiesSelector } from './TaskCrops/managementPlansWithLocationSelector';
import { useMemo } from 'react';
import { currentAndPlannedManagementPlansSelector } from '../managementPlanSlice';

export const useReadOnlyPinCoordinates = () => {
  const managementPlanEntities = useSelector(managementPlanWithCurrentLocationEntitiesSelector);
  const currentManagementPlans = useSelector(currentAndPlannedManagementPlansSelector);

  return useMemo(
    () =>
      currentManagementPlans
        .map(
          ({ management_plan_id }) =>
            managementPlanEntities[management_plan_id].planting_management_plan.pin_coordinate,
        )
        .filter((pin_coordinate) => pin_coordinate),
    [],
  );
};
