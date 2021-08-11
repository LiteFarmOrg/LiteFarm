import PureTaskCrops from '../../../components/AddTask/PureTaskCrops';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { getManagementPlans } from '../../saga';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

function TaskCrops({ history, match }) {
  const dispatch = useDispatch();
  const onContinuePath = '/add_task/task_notes';
  const goBackPath = '/add_task/task_crops';
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

  const managementPlan = {
    crop_variety_name: 'Bolero',
  };

  useEffect(() => {
    dispatch(getManagementPlans());
  }, []);

  console.log();
  return (
    <HookFormPersistProvider>
      <PureTaskCrops
        handleCancel={handleCancel}
        handleGoBack={handleGoBack}
        onError={onError}
        onSubmit={onContinue}
        persistedPaths={persistedPaths}
      />
    </HookFormPersistProvider>
  );
}

export default TaskCrops;
