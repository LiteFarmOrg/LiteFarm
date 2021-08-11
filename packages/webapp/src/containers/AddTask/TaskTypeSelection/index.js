import PureTaskTypeSelection from '../../../components/AddTask/PureTaskTypeSelection';
import { useSelector } from 'react-redux';
import { userFarmSelector } from '../../userFarmSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';

function TaskTypeSelection({ history, match }) {
  const userFarm = useSelector(userFarmSelector);

  const continuePath = '/add_task/task_date';
  const persistedPaths = [continuePath];

  const onCustomTask = () => {
    console.log('Go to LF-1747 custom task creation page');
  };

  const onContinue = () => {
    history.push(continuePath);
  };

  const handleGoBack = () => {
    history.push('/tasks')
  };

  const handleCancel = () => {
    history.push('/tasks')
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
