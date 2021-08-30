import React from 'react';
import PureCompleteStepOne from '../../../components/Task/TaskComplete/StepOne';
import { useSelector } from 'react-redux';
import { loginSelector, measurementSelector } from '../../userFarmSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { taskWithProductById } from '../../taskSlice';
import { productEntitiesSelector } from '../../productSlice';

function TaskCompleteStepOne({ history, match }) {
  const system = useSelector(measurementSelector);
  const { farm_id } = useSelector(loginSelector);
  const task_id = match.params.task_id;
  const task = useSelector(taskWithProductById(task_id));
  const [selectedTaskType] = task.taskType;
  const products = useSelector(productEntitiesSelector);
  const persistedPaths = [`/tasks/${task_id}/complete`];

  const onContinue = (data) => {
    history.push(persistedPaths[0]);
  };

  const onCancel = () => {
    history.push(`/tasks/${task_id}/read_only`);
  };

  const onGoBack = () => {
    history.push(`/tasks/${task_id}/read_only`);
  };

  return (
    <HookFormPersistProvider>
      <PureCompleteStepOne
        onContinue={onContinue}
        onCancel={onCancel}
        onGoBack={onGoBack}
        system={system}
        farm={farm_id}
        selectedTaskType={selectedTaskType}
        products={products}
        persistedPaths={persistedPaths}
        selectedTask={task}
      />
    </HookFormPersistProvider>
  );
}

export default TaskCompleteStepOne;
