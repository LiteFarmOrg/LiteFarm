import PureTaskTypeSelection from '../../../components/AddTask/PureTaskTypeSelection';
import { useDispatch, useSelector } from 'react-redux';
import { userFarmSelector } from '../../userFarmSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useEffect } from 'react';
import { getTaskTypes } from '../../Task/saga';
import { defaultTaskTypesSelector } from '../../taskTypeSlice';

function TaskTypeSelection({ history, match }) {
  const userFarm = useSelector(userFarmSelector);
  const dispatch = useDispatch();
  const taskTypes = useSelector(defaultTaskTypesSelector);
  const continuePath = '/add_task/task_date';
  const persistedPaths = [continuePath];
  console.log(taskTypes);
  useEffect(() => {
    dispatch(getTaskTypes());
  }, []);

  const onCustomTask = () => {
    console.log('Go to LF-1747 custom task creation page');
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
      />
    </HookFormPersistProvider>
  );
}

export default TaskTypeSelection;
