import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import PureManageCustomTasks from '../../../components/AddTask/PureManageCustomTasks';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';

function ManageCustomTasks({ history, match }) {
  const onAddCustomTaskPath = '';
  const onGoBackPath = '/add_task/task_type_selection';
  const persistedPaths = [onGoBackPath, onAddCustomTaskPath];
  const handleGoBack = () => {
    history.push(persistedPaths[0]);
  };

  const handleCancel = () => {
    history.push('/tasks');
  };

  const onAddCustomTask = () => {
    history.push(persistedPaths[1]);
  };

  const onError = () => {
    console.log('onError called');
  };

  return (
    <HookFormPersistProvider>
      <PureManageCustomTasks
        handleCancel={handleCancel}
        handleGoBack={handleGoBack}
        onError={onError}
        onAddCustomTask={onAddCustomTask}
        persistedPaths={persistedPaths}
      />
    </HookFormPersistProvider>
  );
}

export default ManageCustomTasks;
