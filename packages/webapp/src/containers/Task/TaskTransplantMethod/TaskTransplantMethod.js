import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { PureTaskPlantingMethod } from '../../../components/Task/PureTaskPlantingMethod/PureManagementPlanPlantingMethod';
import { hookFormPersistEntryPathSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { useSelector } from 'react-redux';

export default function PlantingMethod({ history, match }) {
  const entryPath = useSelector(hookFormPersistEntryPathSelector);
  return (
    <HookFormPersistProvider>
      <PureTaskPlantingMethod history={history} entryPath={entryPath}/>
    </HookFormPersistProvider>
  );
}
