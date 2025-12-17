import { useHistory, useLocation } from 'react-router-dom';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { PureTaskPlantingMethod } from '../../../components/Task/PureTaskPlantingMethod/PureManagementPlanPlantingMethod';

export default function PlantingMethod() {
  const history = useHistory();
  const location = useLocation();
  return (
    <HookFormPersistProvider>
      <PureTaskPlantingMethod history={history} location={location} />
    </HookFormPersistProvider>
  );
}
