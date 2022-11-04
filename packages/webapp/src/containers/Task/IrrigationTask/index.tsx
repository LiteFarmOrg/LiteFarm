import React, { FC } from 'react';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureIrrigationTask from '../../../components/Task/PureIrrigationTask';
import { ISystem } from '../../../components/Form/Unit/types';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import { RouteComponentProps } from 'react-router-dom';

export interface IIrrigationTask {
  history: RouteComponentProps['history'];
  location: RouteComponentProps['location'];
  match: RouteComponentProps['match'];
}
const IrrigationTask: FC<IIrrigationTask> = ({ history, match, location }) => {
  const system = useSelector(measurementSelector) as ISystem;
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
};
export default IrrigationTask;
