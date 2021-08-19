import React from 'react';
import PureTaskComplete from '../../../components/Task/TaskComplete';
import { useDispatch } from 'react-redux';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { completeTask } from '../saga';

function TaskComplete({ history, match }) {
  const dispatch = useDispatch();
  const task_id = match.params.task_id;
  const persistedPaths = [`/tasks/${task_id}/before_complete`];

  const onSave = (data) => {
    // TODO - Patch task complete
    console.log(data);
  };

  const onCancel = () => {
    history.push('/tasks');
  };

  const onGoBack = () => {
    history.push(persistedPaths[0]);
  };

  return (
    <HookFormPersistProvider>
      <PureTaskComplete onSave={onSave} onCancel={onCancel} onGoBack={onGoBack} persistedPaths={persistedPaths} />
    </HookFormPersistProvider>
  );
}

export default TaskComplete;
