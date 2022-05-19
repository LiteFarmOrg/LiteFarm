import React from 'react';
import PureTaskDate from '../../../components/Task/TaskDate';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useIsTaskType } from '../useIsTaskType';

function TaskDate({ history, match, location }) {
  const onGoBack = () => {
    history.back();
  };
  const isTransplantTask = useIsTaskType('TRANSPLANT_TASK');
  const onContinue = () => {
    history.push(
      isTransplantTask ? '/add_task/task_crops' : '/add_task/task_locations',
      location.state,
    );
  };

  console.log(location);

  return (
    <HookFormPersistProvider>
      <PureTaskDate onGoBack={onGoBack} onContinue={onContinue} />
    </HookFormPersistProvider>
  );
}

export default TaskDate;
