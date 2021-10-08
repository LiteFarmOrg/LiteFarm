import { useSelector } from 'react-redux';
import { taskWithProductSelector } from '../../taskSlice';
import { useMemo } from 'react';
import produce from 'immer';

export const useReadonlyTask = (task_id) => {
  const task = useSelector(taskWithProductSelector(task_id));
  return useMemo(() => {
    return produce(task, (task) => {
      task.managementPlansByPinCoordinate = task.managementPlans.reduce(
        (managementPlansByLocation, managementPlan) => {
          const pin_coordinate =
            managementPlan.prev_planting_management_plan?.pin_coordinate ||
            managementPlan.planting_management_plan?.pin_coordinate;
          if (pin_coordinate) {
            managementPlansByLocation[pin_coordinate] = managementPlan;
          }
          return managementPlansByLocation;
        },
        {},
      );
      task.pinCoordinates = Object.keys(task.managementPlansByPinCoordinate);
      task.locationsById = {};
      for (const location of task.locations) {
        task.locationsById[location.location_id] = location;
      }
      for (const managementPlan of task.managementPlans) {
        const location =
          managementPlan?.prev_planting_management_plan?.location ||
          managementPlan?.planting_management_plan?.location;
        task.locationsById[location.location_id] = location;
      }

      task.managementPlansByLocation = task.managementPlans.reduce(
        (managementPlansByLocation, managementPlan) => {
          const location_id =
            managementPlan.prev_planting_management_plan?.location?.location_id ||
            managementPlan.planting_management_plan?.location?.location_id;
          if (location_id) {
            if (!managementPlansByLocation[location_id])
              managementPlansByLocation[location_id] = [];
            managementPlansByLocation[location_id].push(managementPlan);
          }
          return managementPlansByLocation;
        },
        {},
      );
    });
  }, []);
};
