import { useSelector } from 'react-redux';
import { taskEntitiesSelectorByManagementPlanId } from '../../taskSlice';
import {
  abandonedManagementPlansSelector,
  completedManagementPlansSelector,
  currentManagementPlansSelector,
  managementPlansSelector,
  plannedManagementPlansSelector,
} from '../../managementPlanSlice';
import { useMemo } from 'react';
import { lastActiveDatetimeSelector } from '../../userLogSlice';

export const useManagementPlanCardContents = (crop_variety_id) => {
  const tasksByManagementPlanId = useSelector(taskEntitiesSelectorByManagementPlanId);
  const managementPlans = useSelector(managementPlansSelector);
  const lastActiveTime = useSelector(lastActiveDatetimeSelector);
  const plannedManagementPlans = useSelector(plannedManagementPlansSelector);
  const activeManagementPlans = useSelector(currentManagementPlansSelector);
  const completedManagementPlans = useSelector(completedManagementPlansSelector);
  const abandonedManagementPlans = useSelector(abandonedManagementPlansSelector);

  const getManagementPlanCards = (managementPlans, status) =>
    managementPlans
      .filter((management_plan) => management_plan.crop_variety_id === crop_variety_id)
      .map((management_plan) => {
        const { needs_transplant, transplant_date } = management_plan;
        const shouldDisplayFinalPlantingMethod =
          !needs_transplant ||
          new Date(transplant_date).getTime() >= new Date(lastActiveTime).getTime();
        const planting_management_plan =
          management_plan.planting_management_plans[
            shouldDisplayFinalPlantingMethod ? 'final' : 'initial'
          ];
        const tasks = tasksByManagementPlanId[management_plan.management_plan_id] || [];
        return {
          managementPlanName: management_plan.name,
          locationName: getLocationName(planting_management_plan),
          notes: getNotes(planting_management_plan),
          ...getStartEndDate(tasks),
          numberOfPendingTask: tasks.length,
          status,
        };
      });

  return useMemo(() => {
    return [
      ...getManagementPlanCards(activeManagementPlans, 'active'),
      ...getManagementPlanCards(plannedManagementPlans, 'planned'),
      ...getManagementPlanCards(completedManagementPlans, 'completed'),
      ...getManagementPlanCards(abandonedManagementPlans, 'abandoned'),
    ];
  }, [tasksByManagementPlanId, managementPlans, lastActiveTime, crop_variety_id]);
};

const getLocationName = ({ location, pin_coordinate }) => {
  if (location) {
    return location.name;
  } else if (pin_coordinate) {
    return `${roundToDecimals(pin_coordinate.lat)}, ${roundToDecimals(pin_coordinate.lng)}`;
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

const getStartEndDate = (tasks = []) => {
  let startDate;
  let endDate;
  for (const { planned_time } of tasks) {
    const date = new Date(planned_time).getTime();
    if (!startDate) {
      startDate = date;
    } else if (date < startDate) {
      !endDate && (endDate = startDate);
      startDate = date;
    } else if (!endDate) {
      endDate = date;
    } else if (date > endDate) {
      endDate = date;
    }
  }
  return { startDate, endDate };
};
