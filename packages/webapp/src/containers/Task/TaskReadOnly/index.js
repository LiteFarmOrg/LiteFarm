import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PureTaskReadOnly from '../../../components/Task/TaskReadOnly';
import { isAdminSelector, measurementSelector } from '../../userFarmSlice';
import { userFarmsByFarmSelector } from '../../userFarmSlice';
import { userFarmSelector } from '../../userFarmSlice';
import { taskSelectorById, taskWithProductById } from '../../taskSlice';
import { useManagementPlansByLocationIds } from '../../AddTask/TaskCrops/useManagementPlansByLocationIds';
import { productEntitiesSelector } from '../../productSlice';

function TaskReadOnly({ history, match }) {
  const dispatch = useDispatch();
  const task_id = match.params.task_id;
  const system = useSelector(measurementSelector);
  const task = useSelector(taskWithProductById(task_id));
  const products = useSelector(productEntitiesSelector);
  const users = useSelector(userFarmsByFarmSelector);
  const user = useSelector(userFarmSelector);
  const isAdmin = useSelector(isAdminSelector);
  const isCompleted = task.completed_time !== null;

  const task_locations = task.locations.map(({ location_id }) => ({location_id}));

  const managementPlansByLocationIds = useManagementPlansByLocationIds(task_locations);

  const onGoBack = () => {
    history.push('/tasks');
  };

  const onComplete = () => {
    history.push(`/tasks/${task_id}/before_complete`);
  };

  const onEdit = () => {
    // TODO - LF-1720 Edit task page
  };

  const onAbandon = () => {
    history.push(`/tasks/${task_id}/abandon`);
  };

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
      system={system}
      products={products}
      managementPlansByLocationIds={managementPlansByLocationIds}
      isCompleted={isCompleted}
    />
  );
}

export default TaskReadOnly;
