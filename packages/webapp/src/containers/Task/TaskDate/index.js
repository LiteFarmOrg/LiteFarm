import React from 'react';
import PureTaskDate from '../../../components/Task/TaskDate';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';

function TaskDate({ history, match }) {
  const onGoBack = () => {
    history.push('/add_task/task_type_selection');
  };

  const onContinue = () => {
    history.push('/add_task/task_locations');
  };

  const onCancel = () => {
    console.log('Go to management page');
  };

  return (
    <HookFormPersistProvider>
      <PureTaskDate onGoBack={onGoBack} onContinue={onContinue} onCancel={onCancel} />
    </HookFormPersistProvider>
  );
}

export default TaskDate;
