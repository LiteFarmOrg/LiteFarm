import React, { FC } from 'react';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureIrrigationTask from '../../../components/Task/PureIrrigationTask';

export interface IIrrigationTask {
  history: any;
  match: any;
  location: any;
}
const IrrigationTask: FC<IIrrigationTask> = ({ history, match, location }) => {
  const onGoBack = () => history.back();
  // const onGoBack = () =>  history.push('/add_task/task_crops')
  const onContinue = () => history.push('/');

  return (
    <HookFormPersistProvider>
      <PureIrrigationTask onGoBack={onGoBack} onContinue={onContinue} />
    </HookFormPersistProvider>
  );
};
export default IrrigationTask;
