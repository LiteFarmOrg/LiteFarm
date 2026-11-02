import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { PureTaskPlantingMethod } from '../../../components/Task/PureTaskPlantingMethod/PureManagementPlanPlantingMethod';

export default function PlantingMethod() {
  return (
    <HookFormPersistProvider>
      <PureTaskPlantingMethod />
    </HookFormPersistProvider>
  );
}
