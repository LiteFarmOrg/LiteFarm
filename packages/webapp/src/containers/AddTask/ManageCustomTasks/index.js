import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import PureManageCustomTasks from '../../../components/AddTask/PureManageCustomTasks';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';

function ManageCustomTasks({ history, match }) {
  const onAddCustomTaskPath = '/add_task/add_custom_task';
  const onEditCustomTaskPath = '/add_task/edit_custom_task';
  const onGoBackPath = '/add_task/task_type_selection';
  const persistedPaths = [onGoBackPath, onAddCustomTaskPath, onEditCustomTaskPath];
  const handleGoBack = () => {
    history.push(onGoBackPath);
  };

  const onEditCustomTask = () => {
    history.push(onEditCustomTaskPath);
  };
  const onAddCustomTask = () => {
    history.push(onAddCustomTaskPath);
  };

  const onError = () => {
    console.log('onError called');
  };

  return (
    <HookFormPersistProvider>
      <PureManageCustomTasks
        handleGoBack={handleGoBack}
        onError={onError}
        onAddCustomTask={onAddCustomTask}
        persistedPaths={persistedPaths}
        onEditCustomTask={onEditCustomTask}
      />
    </HookFormPersistProvider>
  );
}

export default ManageCustomTasks;
