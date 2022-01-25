import React from 'react';
import PureCompleteStepOne from '../../../components/Task/TaskComplete/StepOne';
import { useSelector } from 'react-redux';
import { loginSelector, measurementSelector } from '../../userFarmSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { taskWithProductSelector } from '../../taskSlice';
import { productsSelector } from '../../productSlice';

function TaskCompleteStepOne({ history, match }) {
  const system = useSelector(measurementSelector);
  const { farm_id } = useSelector(loginSelector);
  const task_id = match.params.task_id;
  const task = useSelector(taskWithProductSelector(task_id));
  const selectedTaskType = task.taskType;
  const products = useSelector(productsSelector);
  const persistedPaths = [`/tasks/${task_id}/complete`];

  const onContinue = (data) => {
    history.push(persistedPaths[0]);
  };

  const onGoBack = () => {
    history.goBack();
  };

  return (
    <HookFormPersistProvider>
      <PureCompleteStepOne
        onContinue={onContinue}
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
