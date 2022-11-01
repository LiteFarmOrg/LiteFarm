import React, { FC } from 'react';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureIrrigationTask, { ISystem } from '../../../components/Task/PureIrrigationTask';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';

export interface IIrrigationTask {
  history: any;
  match: any;
  location: any;
}
const IrrigationTask: FC<IIrrigationTask> = ({ history, match, location }) => {
  const system = useSelector(measurementSelector) as ISystem;
  const continuePath = '/add_task/task_assignment';
  const goBackPath = '/add_task/task_locations';
  const persistedPaths = [goBackPath, continuePath, '/add_task/task_crops'];
  const handleGoBack = () => {
    history.back();
  };

  return (
    <HookFormPersistProvider>
      <PureIrrigationTask
        handleGoBack={handleGoBack}
        persistedPaths={persistedPaths}
        system={system}
      />
    </HookFormPersistProvider>
  );
};
export default IrrigationTask;
