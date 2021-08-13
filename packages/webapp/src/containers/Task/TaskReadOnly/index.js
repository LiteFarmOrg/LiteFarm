import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PureTaskReadOnly from '../../../components/Task/TaskReadOnly';
import { Label } from '../../../components/Typography';

function TaskReadOnly({ history, match }) {
  const dispatch = useDispatch();
  const task_id = match.params.task_id;

  const onGoBack = () => {
    history.push('/tasks');
  }

  const onComplete = () => {
    // TODO - LF-1750 - Implement complete task
  }

  const onEdit = () => {
    // TODO - LF-1720 Edit task page
  }

  const onAbandon = () => {
    // TODO - LF-1716 Abandon task 
  }

  return (
    <PureTaskReadOnly
      task_id={task_id}
      onGoBack={onGoBack}
      onComplete={onComplete}
      onEdit={onEdit}
      onAbandon={onAbandon}
    />
  );
}

export default TaskReadOnly;