import { useHistory } from 'react-router-dom';
import { PureManageCustomTasks } from '../../../components/Task/PureTaskTypeSelection/PureManageCustomTasks';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useSelector } from 'react-redux';
import { userCreatedTaskTypesSelector } from '../../taskTypeSlice';

function ManageCustomTasks() {
  const history = useHistory();
  const onAddCustomTaskPath = '/add_task/add_custom_task';
  const onEditCustomTaskPath = '/add_task/edit_custom_task';
  const handleGoBack = () => {
    history.back();
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
  const customTasks = useSelector(userCreatedTaskTypesSelector);

  return (
    <HookFormPersistProvider>
      <PureManageCustomTasks
        handleGoBack={handleGoBack}
        onError={onError}
        onAddCustomTask={onAddCustomTask}
        onEditCustomTask={onEditCustomTask}
        customTasks={customTasks}
      />
    </HookFormPersistProvider>
  );
}

export default ManageCustomTasks;
