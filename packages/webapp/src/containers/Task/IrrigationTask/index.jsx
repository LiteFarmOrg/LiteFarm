import React from 'react';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureIrrigationTask from '../../../components/Task/PureIrrigationTask';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import PropTypes from 'prop-types';

export default function IrrigationTask({ history }) {
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
IrrigationTask.propTypes = {
  history: PropTypes.object,
};
