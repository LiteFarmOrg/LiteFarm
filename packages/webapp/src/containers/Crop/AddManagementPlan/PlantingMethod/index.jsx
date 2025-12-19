import PureManagementPlanPlantingMethod from '../../../../components/Crop/PlantingMethod/PureManagementPlanPlantingMethod';
import { useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { measurementSelector } from '../../../userFarmSlice';

export default function PlantingMethod() {
  const match = useRouteMatch();
  const system = useSelector(measurementSelector);
  const isFinalPlantingMethod =
    match.path === '/crop/:variety_id/add_management_plan/final_planting_method';
  return (
    <HookFormPersistProvider>
      <PureManagementPlanPlantingMethod
        match={match}
        system={system}
        isFinalPlantingMethod={isFinalPlantingMethod}
      />
    </HookFormPersistProvider>
  );
}
