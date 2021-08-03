import React from 'react';
import PureTaskDate from '../../../components/Task/TaskDate';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';

function TaskDate({ history, match }) {

  const onGoBack = () => {
    console.log('Go to LF-1564 task type selection');
  }

  const onContinue = () => {
    console.log('Go to LF-1567 Task locations');
  }

  const onCancel = () => {
    console.log('Go to management page');
  }

  return (
    <HookFormPersistProvider>
     <PureTaskDate
        onGoBack={onGoBack}
        onContinue={onContinue}
        onCancel={onCancel}
     />
    </HookFormPersistProvider>
  );
}

export default TaskDate;
