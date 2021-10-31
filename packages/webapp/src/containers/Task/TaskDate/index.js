import React from 'react';
import PureTaskDate from '../../../components/Task/TaskDate';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useIsTaskType } from '../useIsTaskType';
import { hookFormPersistEntryPathSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { useSelector } from 'react-redux';

function TaskDate({ history, match }) {
  const entryPath = useSelector(hookFormPersistEntryPathSelector);
  const onGoBack = () => {
    history.push('/add_task/task_type_selection');
  };
  const isTransplantTask = useIsTaskType('TRANSPLANT_TASK');
  const onContinue = () => {
    history.push(isTransplantTask ? '/add_task/task_crops' : '/add_task/task_locations');
  };

  const onCancel = () => {
    history.push(entryPath);
  };

  return (
    <HookFormPersistProvider>
      <PureTaskDate onGoBack={onGoBack} onContinue={onContinue} onCancel={onCancel} />
    </HookFormPersistProvider>
  );
}

export default TaskDate;
