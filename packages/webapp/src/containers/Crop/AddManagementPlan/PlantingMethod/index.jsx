import PureManagementPlanPlantingMethod from '../../../../components/Crop/PlantingMethod/PureManagementPlanPlantingMethod';
import { useSelector } from 'react-redux';
import { useMatch } from 'react-router-dom';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { measurementSelector } from '../../../userFarmSlice';

export default function PlantingMethod() {
  const system = useSelector(measurementSelector);
  const isFinalPlantingMethod = useMatch(
    '/crop/:variety_id/add_management_plan/final_planting_method',
  );
  return (
    <HookFormPersistProvider>
      <PureManagementPlanPlantingMethod
        system={system}
        isFinalPlantingMethod={isFinalPlantingMethod}
      />
    </HookFormPersistProvider>
  );
}
