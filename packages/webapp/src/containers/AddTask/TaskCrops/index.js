import PureTaskCrops from '../../../components/AddTask/PureTaskCrops';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';

function TaskCrops({ history, match }) {
  const handleGoBack = () => {};

  const handleCancel = () => {};

  const onSubmit = () => {};

  const onError = () => {};

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
