import PureTaskCrops from '../../../components/AddTask/PureTaskCrops';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useSelector } from 'react-redux';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { useManagementPlansByLocationIds, useActiveAndCurrentManagementPlansByLocationIds } from './useManagementPlansByLocationIds';
import { taskTypeById } from '../../taskTypeSlice';

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

  const HARVEST_TYPE = 'HARVEST';

  const persistedFormData = useSelector(hookFormPersistSelector);
  const managementPlansByLocationIds = useManagementPlansByLocationIds(persistedFormData.locations);
  const selectedTaskType = useSelector(taskTypeById(persistedFormData.type));
  const activeAndCurrentManagementPlansByLocationIds = useActiveAndCurrentManagementPlansByLocationIds(persistedFormData.locations);

  return (
    <HookFormPersistProvider>
      <PureTaskCrops
        handleCancel={handleCancel}
        handleGoBack={handleGoBack}
        onError={onError}
        onSubmit={onContinue}
        persistedPaths={persistedPaths}
        managementPlansByLocationIds={selectedTaskType.task_translation_key === HARVEST_TYPE ? 
          activeAndCurrentManagementPlansByLocationIds : managementPlansByLocationIds
        }
        onContinue={onContinue}
      />
    </HookFormPersistProvider>
  );
}

export default TaskCrops;
