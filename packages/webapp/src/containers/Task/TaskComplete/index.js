import React from 'react';
import PureTaskComplete from '../../../components/Task/TaskComplete';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';


function TaskComplete({ history, match }) {

  const onSave = () => {
  }

  const onCancel = () => {
  }

  const onGoBack = () => {
  }

  return (
    <HookFormPersistProvider>
      <PureTaskComplete
        onSave={onSave}
        onCancel={onCancel}
        onGoBack={onGoBack}
      />
    </HookFormPersistProvider>
  );
}

export default TaskComplete;