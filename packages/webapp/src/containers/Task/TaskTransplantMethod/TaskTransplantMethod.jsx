import { useLocation } from 'react-router-dom';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { PureTaskPlantingMethod } from '../../../components/Task/PureTaskPlantingMethod/PureManagementPlanPlantingMethod';

export default function PlantingMethod() {
  const location = useLocation();
  return (
    <HookFormPersistProvider>
      <PureTaskPlantingMethod location={location} />
    </HookFormPersistProvider>
  );
}
