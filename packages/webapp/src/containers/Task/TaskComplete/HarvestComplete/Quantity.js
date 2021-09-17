import React from 'react';
import { useSelector } from 'react-redux';
import PureHarvestCompleteQuantity from '../../../../components/Task/TaskComplete/HarvestComplete/Quantity';
import { measurementSelector } from '../../../userFarmSlice';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';

function HarvestCompleteQuantity({ history, match }) {
  const system = useSelector(measurementSelector);
  const task_id = match.params.task_id;
  const persistedPaths = [`/tasks/${task_id}/harvest_uses`];

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
        persistedPaths={persistedPaths}
      />
    </HookFormPersistProvider>
  );
}

export default HarvestCompleteQuantity;
