import { PureManageCustomTasks } from '../../../components/Task/PureTaskTypeSelection/PureManageCustomTasks';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useSelector } from 'react-redux';
import { userCreatedTaskTypes } from '../../taskTypeSlice';

function ManageCustomTasks({ history, match }) {
  const onAddCustomTaskPath = '/add_task/add_custom_task';
  const onEditCustomTaskPath = '/add_task/edit_custom_task';
  const onGoBackPath = '/add_task/task_type_selection';
  const persistedPaths = [onGoBackPath, onAddCustomTaskPath, onEditCustomTaskPath];
  const handleGoBack = () => {
    history.goBack();
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
  const customTasks = useSelector(userCreatedTaskTypes);

  return (
    <HookFormPersistProvider>
      <PureManageCustomTasks
        handleGoBack={handleGoBack}
        onError={onError}
        onAddCustomTask={onAddCustomTask}
        persistedPaths={persistedPaths}
        onEditCustomTask={onEditCustomTask}
        customTasks={customTasks}
      />
    </HookFormPersistProvider>
  );
}

export default ManageCustomTasks;
