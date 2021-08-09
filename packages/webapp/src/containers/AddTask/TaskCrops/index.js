import PureTaskCrops from '../../../components/AddTask/PureTaskCrops';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { getManagementPlans } from '../../saga';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

function TaskCrops({ history, match }) {
  const dispatch = useDispatch();
  const handleGoBack = () => {};

  const handleCancel = () => {};

  const onSubmit = () => {};

  const onError = () => {};

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
        onSubmit={onSubmit}
      />
    </HookFormPersistProvider>
  );
}

export default TaskCrops;
