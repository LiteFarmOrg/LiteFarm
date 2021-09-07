import React from 'react';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureHarvestUses from '../../../../components/Task/TaskComplete/HarvestComplete/HarvestUses';
import { hookFormPersistSelector } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';

function HarvestUses({ history, match }) {
  const system = useSelector(measurementSelector);
  const task_id = match.params.task_id;
  const persistedPaths = [`/tasks/${task_id}/complete_harvest_quantity`];
  const persistedFormData = useSelector(hookFormPersistSelector);

  const onContinue = (data) => {

  };

  const onCancel = () => {
    history.push(`/tasks/${task_id}/read_only`);
  };

  const onGoBack = () => {
    history.push(`/tasks/${task_id}/complete_harvest_quantity`);
  };

  return (
    <HookFormPersistProvider>
      <PureHarvestUses
        system={system}
        onCancel={onCancel}
        onGoBack={onGoBack}
        onContinue={onContinue}
        persistedPaths={persistedPaths}
        amount={persistedFormData?.actual_quantity}
        unit={persistedFormData?.actual_quantity_unit?.label}
      />
    </HookFormPersistProvider>
  );
}

export default HarvestUses;
