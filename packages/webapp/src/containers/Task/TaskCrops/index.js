import PureTaskCrops from '../../../components/Task/PureTaskCrops';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useSelector } from 'react-redux';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { useActiveAndCurrentManagementPlanTilesByLocationIds } from './useManagementPlanTilesByLocationIds';
import { cropLocationsSelector } from '../../locationSlice';
import { useIsTaskType } from '../useIsTaskType';

export default function ManagementPlanSelector({ history, match }) {
  const isTransplantTask = useIsTaskType('TRANSPLANT_TASK');
  return isTransplantTask ? (
    <TransplantManagementPlansSelector history={history} match={match} />
  ) : (
    <TaskCrops history={history} match={match} />
  );
}

function TransplantManagementPlansSelector({ history, match }) {
  const locations = useSelector(cropLocationsSelector);
  const onContinuePath = '/add_task/task_locations';
  const goBackPath = '/add_task/task_date';
  return (
    <TaskCrops
      locations={locations}
      onContinuePath={onContinuePath}
      goBackPath={goBackPath}
      history={history}
      match={match}
      isMulti={false}
    />
  );
}

function TaskCrops({
  history,
  match,
  goBackPath = '/add_task/task_locations',
  onContinuePath = '/add_task/task_details',
  locations,
}) {
  const persistedPaths = [goBackPath, onContinuePath];
  const handleGoBack = () => {
    history.goBack();
  };
  const handleCancel = () => {
    history.push('/tasks');
  };
  const onContinue = () => {
    history.push(onContinuePath);
  };
  const onError = () => {};
  const persistedFormData = useSelector(hookFormPersistSelector);
  const activeAndCurrentManagementPlansByLocationIds = useActiveAndCurrentManagementPlanTilesByLocationIds(
    locations || persistedFormData.locations,
  );
  const isTransplantTask = useIsTaskType('TRANSPLANT_TASK');

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
        isMulti={!isTransplantTask}
      />
    </HookFormPersistProvider>
  );
}
