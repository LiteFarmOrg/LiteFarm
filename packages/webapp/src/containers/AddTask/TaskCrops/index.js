import PureTaskCrops from '../../../components/AddTask/PureTaskCrops';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useSelector } from 'react-redux';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { taskTypeById } from '../../taskTypeSlice';
import { getDateUTC } from '../../../util/moment';
import { useManagementPlanTilesByLocationIds, useActiveAndCurrentManagementPlansByLocationIds } from './useManagementPlanTilesByLocationIds';

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
  const selectedTaskType = useSelector(taskTypeById(persistedFormData.type));
  const due_date = persistedFormData.due_date;
  const activeAndCurrentManagementPlansByLocationIds = useActiveAndCurrentManagementPlansByLocationIds(persistedFormData.locations, getDateUTC(due_date).toDate().getTime());
  const managementPlansByLocationIds = useManagementPlanTilesByLocationIds(
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
        managementPlansByLocationIds={selectedTaskType.task_translation_key === HARVEST_TYPE ? 
          activeAndCurrentManagementPlansByLocationIds : managementPlansByLocationIds
        }
        onContinue={onContinue}
      />
    </HookFormPersistProvider>
  );
}

export default TaskCrops;
