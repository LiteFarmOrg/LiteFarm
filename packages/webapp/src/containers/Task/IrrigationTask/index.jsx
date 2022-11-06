import React from 'react';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureIrrigationTask from '../../../components/Task/PureIrrigationTask';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';

export default function IrrigationTask({ history, match, location }) {
  const system = useSelector(measurementSelector);
  const handleGoBack = () => {
    history.back();
  };

  return (
    <HookFormPersistProvider>
      <PureIrrigationTask
        handleGoBack={handleGoBack}
        handleContinue={() => history.push(`/add_task/task_assignment`)}
        system={system}
      />
    </HookFormPersistProvider>
  );
}
