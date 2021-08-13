import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PureTaskReadOnly from '../../../components/Task/TaskReadOnly';
import { isAdminSelector } from '../../userFarmSlice';
import { userFarmsByFarmSelector } from '../../userFarmSlice';
import { userFarmSelector } from '../../userFarmSlice';
import { taskSelectorById } from '../../taskSlice';

function TaskReadOnly({ history, match }) {
  const dispatch = useDispatch();
  const task_id = match.params.task_id;
  const task = useSelector(taskSelectorById(task_id));

  const users = useSelector(userFarmsByFarmSelector);
  const user = useSelector(userFarmSelector);
  const isAdmin = useSelector(isAdminSelector);

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
      task={task}
      users={users}
      user={user}
      isAdmin={isAdmin}
    />
  );
}

export default TaskReadOnly;