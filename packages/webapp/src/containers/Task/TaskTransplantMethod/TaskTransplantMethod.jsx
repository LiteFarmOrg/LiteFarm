import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import {
  PureTaskPlantingMethod,
} from '../../../components/Task/PureTaskPlantingMethod/PureManagementPlanPlantingMethod';

export default function PlantingMethod({ history, match }) {


  return (
    <HookFormPersistProvider>
      <PureTaskPlantingMethod history={history} />
    </HookFormPersistProvider>
  );
}
