import { useSelector } from 'react-redux';
import { taskEntitiesByManagementPlanIdSelector } from '../../taskSlice';
import {
  abandonedManagementPlansSelector,
  completedManagementPlansSelector,
  currentManagementPlansSelector,
  plannedManagementPlansSelector,
} from '../../managementPlanSlice';
import { useMemo } from 'react';
import { lastActiveDatetimeSelector } from '../../userLogSlice';
import { getTasksMinMaxDate } from '../../Task/getTasksMinMaxDate';
import { managementPlanWithCurrentLocationEntitiesSelector } from '../../Task/TaskCrops/managementPlansWithLocationSelector';

export const useManagementPlanCardContents = (crop_variety_id) => {
  const tasksByManagementPlanId = useSelector(taskEntitiesByManagementPlanIdSelector);
  const managementPlanEntities = useSelector(managementPlanWithCurrentLocationEntitiesSelector);
  const lastActiveTime = useSelector(lastActiveDatetimeSelector);
  const plannedManagementPlans = useSelector(plannedManagementPlansSelector);
  const activeManagementPlans = useSelector(currentManagementPlansSelector);
  const completedManagementPlans = useSelector(completedManagementPlansSelector);
  const abandonedManagementPlans = useSelector(abandonedManagementPlansSelector);
  const getManagementPlanCards = (managementPlans, status) =>
    managementPlans
      .filter((management_plan) => management_plan.crop_variety_id === crop_variety_id)
      .map((management_plan) => {
        const planting_management_plan =
          managementPlanEntities[management_plan.management_plan_id].planting_management_plan;
        const tasks = tasksByManagementPlanId[management_plan.management_plan_id] || [];
        return {
          managementPlanName: management_plan.name,
          locationName: getLocationName(planting_management_plan),
          notes: getNotes(planting_management_plan),
          ...getTasksMinMaxDate(tasks),
          numberOfPendingTask: tasks.length,
          status,
          score: management_plan.rating,
          management_plan_id: management_plan.management_plan_id,
        };
      });

  return useMemo(() => {
    return [
      ...getManagementPlanCards(activeManagementPlans, 'active'),
      ...getManagementPlanCards(plannedManagementPlans, 'planned'),
      ...getManagementPlanCards(completedManagementPlans, 'completed'),
      ...getManagementPlanCards(abandonedManagementPlans, 'abandoned'),
    ];
  }, [tasksByManagementPlanId, managementPlanEntities, lastActiveTime, crop_variety_id]);
};

export const getLocationName = ({ location, pin_coordinate }, numberOfDecimals) => {
  if (location) {
    return location.name;
  } else if (pin_coordinate) {
    return `${roundToDecimals(pin_coordinate.lat, numberOfDecimals)}, ${roundToDecimals(
      pin_coordinate.lng,
      numberOfDecimals,
    )}`;
  }
};

const roundToDecimals = (number, numberOfDecimals = 2) => {
  const tenToPower = Math.pow(10, numberOfDecimals);
  return Math.round(number * tenToPower) / tenToPower;
};

const getNotes = (planting_management_plan) => {
  if (planting_management_plan.row_method) return planting_management_plan.row_method.specify_rows;
  if (planting_management_plan.bed_method) return planting_management_plan.bed_method.specify_beds;
  return planting_management_plan.notes;
};
