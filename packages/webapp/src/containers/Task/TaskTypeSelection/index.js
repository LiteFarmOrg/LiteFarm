import PureTaskTypeSelection from '../../../components/Task/PureTaskTypeSelection';
import { useDispatch, useSelector } from 'react-redux';
import { userFarmSelector } from '../../userFarmSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useEffect } from 'react';
import { getTaskTypes } from '../saga';
import { defaultTaskTypesSelector, userCreatedTaskTypes } from '../../taskTypeSlice';

function TaskTypeSelection({ history, match }) {
  const userFarm = useSelector(userFarmSelector);
  const dispatch = useDispatch();
  const taskTypes = useSelector(defaultTaskTypesSelector);
  const customTasks = useSelector(userCreatedTaskTypes);
  const continuePath = '/add_task/task_date';
  const customTaskPath = '/add_task/manage_custom_tasks';
  const persistedPaths = [continuePath, customTaskPath];

  useEffect(() => {
    dispatch(getTaskTypes());
  }, []);

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
        taskTypes={taskTypes}
        customTasks={customTasks}
      />
    </HookFormPersistProvider>
  );
}

export default TaskTypeSelection;
