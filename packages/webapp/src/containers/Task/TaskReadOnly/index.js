import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PureTaskReadOnly from '../../../components/Task/TaskReadOnly';
import {
  isAdminSelector,
  measurementSelector,
  userFarmsByFarmSelector,
  userFarmSelector,
} from '../../userFarmSlice';
import { taskWithProductById } from '../../taskSlice';
import { useManagementPlanTilesByLocationIds } from '../TaskCrops/useManagementPlanTilesByLocationIds';
import { productEntitiesSelector } from '../../productSlice';
import { setFormData } from '../../hooks/useHookFormPersist/hookFormPersistSlice';

function TaskReadOnly({ history, match }) {
  const task_id = match.params.task_id;
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const task = useSelector(taskWithProductById(task_id));
  const products = useSelector(productEntitiesSelector);
  const users = useSelector(userFarmsByFarmSelector);
  const user = useSelector(userFarmSelector);
  const isAdmin = useSelector(isAdminSelector);
  const isCompleted = task.completed_time !== null;
  const isTaskTypeCustom = !!task.taskType.farm_id;

  const task_locations = task.locations.map(({ location_id }) => ({ location_id }));
  const managementPlanIds = task.managementPlans.map(
    ({ management_plan_id }) => management_plan_id,
  );
  const managementPlansByLocationIds = useManagementPlanTilesByLocationIds(
    task_locations,
    managementPlanIds,
  );

  const selectedTaskType = task.taskType;
  const isHarvest = selectedTaskType?.task_translation_key === 'HARVEST_TASK';

  const onGoBack = () => {
    history.goBack();
  };

  const onComplete = () => {
    if (isHarvest) {
      history.push(`/tasks/${task_id}/complete_harvest_quantity`);
    } else if (isTaskTypeCustom) {
      dispatch(setFormData({ task_id, taskType: task.taskType }));
      history.push(`/tasks/${task_id}/complete`);
    } else {
      history.push(`/tasks/${task_id}/before_complete`);
    }
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
      isTaskTypeCustom={isTaskTypeCustom}
    />
  );
}

export default TaskReadOnly;
