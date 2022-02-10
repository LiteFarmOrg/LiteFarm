import { useSelector } from 'react-redux';
import { taskEntitiesByManagementPlanIdSelector, taskWithProductSelector } from '../../taskSlice';
import { useMemo } from 'react';
import produce from 'immer';
import { getLocationName } from '../../Crop/CropManagement/useManagementPlanCardContents';
import { getTasksMinMaxDate } from '../getTasksMinMaxDate';

const getManagementPlanTile = (managementPlan, tasksByManagementPlanId) =>
  produce(managementPlan, (managementPlan) => {
    const tasks = tasksByManagementPlanId[managementPlan.management_plan_id];
    managementPlan.firstTaskDate = getTasksMinMaxDate(tasks).startDate;
    managementPlan.status = managementPlan.start_date ? 'active' : 'planned';
  });

export const useReadonlyTask = (task_id) => {
  const task = useSelector(taskWithProductSelector(task_id));
  const tasksByManagementPlanId = useSelector(taskEntitiesByManagementPlanIdSelector);

  const getTransplantTask = (task) => {
    const managementPlan = task.managementPlans[0];
    const { prev_planting_management_plan, planting_management_plan } = managementPlan;
    task.pinCoordinates = [];
    task.managementPlansByPinCoordinate = {};
    task.managementPlansByLocation = {};
    const pin_coordinate = prev_planting_management_plan.pin_coordinate;
    if (pin_coordinate) {
      task.pinCoordinates.push(pin_coordinate);
      task.managementPlansByPinCoordinate[getLocationName({ pin_coordinate }, 6)] =
        getManagementPlanTile(managementPlan, tasksByManagementPlanId);
    } else {
      task.managementPlansByLocation[prev_planting_management_plan.location_id] = [
        getManagementPlanTile(managementPlan, tasksByManagementPlanId),
      ];
      task.locations.push(prev_planting_management_plan.location);
    }
    task.locationsById = getLocationsById(task);
    task.selectedLocationIds = [planting_management_plan.location_id];
  };
  const getTask = (task) => {
    task.pinCoordinates = [];
    task.managementPlansByPinCoordinate = task.managementPlans.reduce(
      (managementPlansByLocation, managementPlan) => {
        const pin_coordinate = managementPlan.planting_management_plan?.pin_coordinate;
        if (pin_coordinate) {
          task.pinCoordinates.push(pin_coordinate);
          managementPlansByLocation[getLocationName({ pin_coordinate }, 6)] = managementPlan;
        }
        return managementPlansByLocation;
      },
      {},
    );
    task.locationsById = getLocationsById(task);

    task.managementPlansByLocation = task.managementPlans.reduce(
      (managementPlansByLocation, managementPlan) => {
        const location_id = managementPlan.planting_management_plan?.location?.location_id;
        if (location_id) {
          if (!managementPlansByLocation[location_id]) managementPlansByLocation[location_id] = [];
          managementPlansByLocation[location_id].push(
            getManagementPlanTile(managementPlan, tasksByManagementPlanId),
          );
        }
        return managementPlansByLocation;
      },
      {},
    );
  };

  return useMemo(() => {
    return produce(task, task.transplant_task ? getTransplantTask : getTask);
  }, [task]);
};

const getLocationsById = (task) => {
  const locationsById = {};
  for (const location of task.locations) {
    locationsById[location.location_id] = location;
  }
  for (const managementPlan of task.managementPlans) {
    const location = managementPlan?.planting_management_plan?.location;
    location && (locationsById[location.location_id] = location);
    const prevLocation = managementPlan?.prev_planting_management_plan?.location;
    prevLocation && (locationsById[prevLocation.location_id] = location);
  }
  return locationsById;
};
