import React from 'react';
import PureTaskComplete from '../../../components/Task/TaskComplete';
import { useDispatch } from 'react-redux';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { completeTask } from '../saga';

function TaskComplete({ history, match, location }) {
  const dispatch = useDispatch();
  const task_id = match.params.task_id;

  const returnPath = location?.state?.pathname ?? null;
  const onSave = (data) => {
    dispatch(completeTask({ task_id, data, returnPath }));
  };

  const onGoBack = () => {
    history.back();
  };

  return (
    <HookFormPersistProvider>
      <PureTaskComplete onSave={onSave} onGoBack={onGoBack} />
    </HookFormPersistProvider>
  );
}

export default TaskComplete;
