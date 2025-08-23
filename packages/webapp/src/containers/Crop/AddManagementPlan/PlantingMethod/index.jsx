import PureManagementPlanPlantingMethod from '../../../../components/Crop/PlantingMethod/PureManagementPlanPlantingMethod';
import { useSelector } from 'react-redux';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { measurementSelector } from '../../../userFarmSlice';
import { useHistory, useRouteMatch } from 'react-router-dom';

export default function PlantingMethod() {
  const history = useHistory();
  const match = useRouteMatch();
  const system = useSelector(measurementSelector);
  const isFinalPlantingMethod =
    match.path === '/crop/:variety_id/add_management_plan/final_planting_method';
  return (
    <HookFormPersistProvider>
      <PureManagementPlanPlantingMethod
        match={match}
        history={history}
        system={system}
        isFinalPlantingMethod={isFinalPlantingMethod}
      />
    </HookFormPersistProvider>
  );
}
