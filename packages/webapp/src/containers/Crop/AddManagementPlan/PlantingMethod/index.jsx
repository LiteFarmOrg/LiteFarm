import PureManagementPlanPlantingMethod from '../../../../components/Crop/PlantingMethod/PureManagementPlanPlantingMethod';
import { useSelector } from 'react-redux';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { measurementSelector } from '../../../userFarmSlice';
import { useMatch } from 'react-router';

export default function PlantingMethod() {
  const system = useSelector(measurementSelector);
  const isFinalPlantingMethod = useMatch(
    '/crop/:variety_id/add_management_plan/final_planting_method',
  )
    ? true
    : false;
  return (
    <HookFormPersistProvider>
      <PureManagementPlanPlantingMethod
        system={system}
        isFinalPlantingMethod={isFinalPlantingMethod}
      />
    </HookFormPersistProvider>
  );
}
