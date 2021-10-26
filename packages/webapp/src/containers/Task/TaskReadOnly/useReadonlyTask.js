import { useSelector } from 'react-redux';
import { taskWithProductSelector } from '../../taskSlice';
import { useMemo } from 'react';
import produce from 'immer';
import { getLocationName } from '../../Crop/CropManagement/useManagementPlanCardContents';

export const useReadonlyTask = (task_id) => {
  const task = useSelector(taskWithProductSelector(task_id));

  return useMemo(() => {
    return produce(task, task.transplant_task ? getTransplantTask : getTask);
  }, []);
};
const getTransplantTask = (task) => {
  const managementPlan = task.managementPlans[0];
  const { prev_planting_management_plan, planting_management_plan } = managementPlan;
  task.pinCoordinates = [];
  task.managementPlansByPinCoordinate = {};
  task.managementPlansByLocation = {};
  const pin_coordinate = prev_planting_management_plan.pin_coordinate;
  if (pin_coordinate) {
    task.pinCoordinates.push(pin_coordinate);
    task.managementPlansByPinCoordinate[getLocationName({ pin_coordinate }, 6)] = managementPlan;
  } else {
    task.managementPlansByLocation[prev_planting_management_plan.location_id] = [managementPlan];
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
        managementPlansByLocation[location_id].push(managementPlan);
      }
      return managementPlansByLocation;
    },
    {},
  );
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
