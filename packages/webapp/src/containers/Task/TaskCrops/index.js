import PureTaskCrops from '../../../components/Task/PureTaskCrops';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useSelector } from 'react-redux';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { useActiveAndCurrentManagementPlanTilesByLocationIds } from './useManagementPlanTilesByLocationIds';

function TaskCrops({ history, match }) {
  const onContinuePath = '/add_task/task_details';
  const goBackPath = '/add_task/task_locations';
  const persistedPaths = [goBackPath, onContinuePath];
  const handleGoBack = () => {
    history.push(persistedPaths[0]);
  };
  const handleCancel = () => {
    history.push('/tasks');
  };
  const onContinue = () => {
    history.push(persistedPaths[1]);
  };
  const onError = () => {
    console.log('onError called');
  };
  const persistedFormData = useSelector(hookFormPersistSelector);
  const activeAndCurrentManagementPlansByLocationIds = useActiveAndCurrentManagementPlanTilesByLocationIds(
    persistedFormData.locations,
  );

  return (
    <HookFormPersistProvider>
      <PureTaskCrops
        handleCancel={handleCancel}
        handleGoBack={handleGoBack}
        onError={onError}
        onSubmit={onContinue}
        persistedPaths={persistedPaths}
        managementPlansByLocationIds={activeAndCurrentManagementPlansByLocationIds}
        onContinue={onContinue}
      />
    </HookFormPersistProvider>
  );
}

export default TaskCrops;
