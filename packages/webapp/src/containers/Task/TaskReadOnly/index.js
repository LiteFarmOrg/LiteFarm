import React from 'react';
import { useSelector } from 'react-redux';
import PureTaskReadOnly from '../../../components/Task/TaskReadOnly';
import { isAdminSelector, measurementSelector } from '../../userFarmSlice';
import { userFarmsByFarmSelector } from '../../userFarmSlice';
import { userFarmSelector } from '../../userFarmSlice';
import { taskWithProductById } from '../../taskSlice';
import { useManagementPlansByLocationIds } from '../../AddTask/TaskCrops/useManagementPlansByLocationIds';
import { productEntitiesSelector } from '../../productSlice';
import { cloneObject } from '../../../util';

function TaskReadOnly({ history, match }) {
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

  let task_management_plans = task.managementPlans.map(({ management_plan_id }) => (management_plan_id));

  let filtered_managment_plans = cloneObject(managementPlansByLocationIds);
  for (let location in filtered_managment_plans) {
    filtered_managment_plans[location] = filtered_managment_plans[location].filter(({ management_plan_id }) => task_management_plans.includes(management_plan_id));
  }

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
      managementPlansByLocationIds={filtered_managment_plans}
      hasManagementPlans={task_management_plans.length > 0}
      isCompleted={isCompleted}
    />
  );
}

export default TaskReadOnly;
