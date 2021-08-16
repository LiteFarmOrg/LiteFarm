import PureTaskTypeSelection from '../../../components/AddTask/PureTaskTypeSelection';
import { useSelector } from 'react-redux';
import { userFarmSelector } from '../../userFarmSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';

function TaskTypeSelection({ history, match }) {
  const userFarm = useSelector(userFarmSelector);

  const continuePath = '/add_task/task_date';
  const customTaskPath = '/add_task/manage_custom_tasks';
  const persistedPaths = [continuePath, customTaskPath];

  const onCustomTask = () => {
    history.push(customTaskPath);
  };

  const onContinue = () => {
    history.push(continuePath);
  };

  const handleGoBack = () => {
    history.push('/tasks');
  };

  const handleCancel = () => {
    history.push('/tasks');
  };

  const onError = () => {};

  return (
    <HookFormPersistProvider>
      <PureTaskTypeSelection
        history={history}
        onCustomTask={onCustomTask}
        handleCancel={handleCancel}
        handleGoBack={handleGoBack}
        persistedPaths={persistedPaths}
        onContinue={onContinue}
        onError={onError}
      />
    </HookFormPersistProvider>
  );
}

export default TaskTypeSelection;
