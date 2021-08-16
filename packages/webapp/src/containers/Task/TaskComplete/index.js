import React from 'react';
import PureTaskComplete from '../../../components/Task/TaskComplete';


function TaskComplete({ history, match }) {

  const onSave = (data) => {
    // TODO - Patch task complete
    console.log(data);
  }

  const onCancel = () => {
    // TODO - Cancel task complete
  }

  const onGoBack = () => {
    // TODO - Go to LF-1802
  }

  return (
    <PureTaskComplete
      onSave={onSave}
      onCancel={onCancel}
      onGoBack={onGoBack}
    />
  );
}

export default TaskComplete;