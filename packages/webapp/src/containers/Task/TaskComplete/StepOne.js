import React from 'react';
import PureCompleteStepOne from '../../../components/Task/TaskComplete/StepOne';
import { useSelector } from 'react-redux';
import { loginSelector, measurementSelector } from '../../userFarmSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { taskSelectorById } from '../../taskSlice';
import { productEntitiesSelector } from '../../productSlice';


function TaskCompleteStepOne({ history, match }) {
  const system = useSelector(measurementSelector);
  const { farm_id } = useSelector(loginSelector);
  const task_id = match.params.task_id;
  const task = useSelector(taskSelectorById(task_id));
  const selectedTaskType = task.type;
  const products = useSelector(productEntitiesSelector);
  const persistedPaths = [`/tasks/${task_id}/complete`];

  const onSave = (data) => {
    history.push(persistedPaths[0]);
  }

  const onCancel = () => {
    history.push(`/tasks/${task_id}/read_only`)
  }

  const onGoBack = () => {
    history.push(`/tasks/${task_id}/read_only`)
  }

  return (
    <HookFormPersistProvider>
      <PureCompleteStepOne
        onContinue={onSave}
        onCancel={onCancel}
        onGoBack={onGoBack}
        system={system}
        farm={farm_id}
        selectedTaskType={selectedTaskType}
        products={products}
        persistedPaths={persistedPaths}
      />
    </HookFormPersistProvider>
  );
}

export default TaskCompleteStepOne;