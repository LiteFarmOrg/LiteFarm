import { useSelector } from 'react-redux';
import {
  currentManagementPlansByLocationIdSelector,
  expiredManagementPlansByLocationIdSelector,
  plannedManagementPlansByLocationIdSelector,
} from '../../Task/TaskCrops/managementPlansWithLocationSelector';

export default function useLocationCrops(location_id) {
  const activeCrops = useSelector(currentManagementPlansByLocationIdSelector(location_id));
  const pastCrops = useSelector(expiredManagementPlansByLocationIdSelector(location_id));
  const plannedCrops = useSelector(plannedManagementPlansByLocationIdSelector(location_id));

  return {
    activeCrops,
    pastCrops,
    plannedCrops,
  };
}
