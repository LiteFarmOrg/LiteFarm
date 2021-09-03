import React from 'react';
import { useSelector } from 'react-redux';
import PureHarvestCompleteQuantity from '../../../../components/Task/TaskComplete/HarvestComplete/Quantity';
import { measurementSelector } from '../../../userFarmSlice';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { taskWithProductById } from '../../../taskSlice';

function HarvestCompleteQuantity({ history, match }) {
  const system = useSelector(measurementSelector);
  const task_id = match.params.task_id;
  const task = useSelector(taskWithProductById(task_id));

  const onContinue = (data) => {

  };

  const onCancel = () => {
    history.push(`/tasks/${task_id}/read_only`);
  };

  const onGoBack = () => {
    history.push(`/tasks/${task_id}/read_only`);
  };

  return (
    <HookFormPersistProvider>
      <PureHarvestCompleteQuantity
        onCancel={onCancel}
        onGoBack={onGoBack}
        onContinue={onContinue}
        system={system}
      />
    </HookFormPersistProvider>
  );
}

export default HarvestCompleteQuantity;
