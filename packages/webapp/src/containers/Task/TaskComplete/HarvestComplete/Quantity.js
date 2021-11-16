import React from 'react';
import { useSelector } from 'react-redux';
import PureHarvestCompleteQuantity from '../../../../components/Task/TaskComplete/HarvestComplete/Quantity';
import { measurementSelector } from '../../../userFarmSlice';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { taskWithProductSelector } from '../../../taskSlice';

function HarvestCompleteQuantity({ history, match }) {
  const system = useSelector(measurementSelector);
  const task_id = match.params.task_id;
  const persistedPaths = [`/tasks/${task_id}/harvest_uses`];
  const task = useSelector(taskWithProductSelector(task_id));

  const onContinue = (data) => {
    history.push(`/tasks/${task_id}/harvest_uses`);
  };

  const onCancel = () => {
    history.goBack();
  };

  const onGoBack = () => {
    history.goBack();
  };

  return (
    <HookFormPersistProvider>
      <PureHarvestCompleteQuantity
        onCancel={onCancel}
        onGoBack={onGoBack}
        onContinue={onContinue}
        system={system}
        task={task}
        persistedPaths={persistedPaths}
      />
    </HookFormPersistProvider>
  );
}

export default HarvestCompleteQuantity;
