import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PureTaskReadOnly from '../../../components/Task/TaskReadOnly';
import { isAdminSelector, measurementSelector, userFarmsByFarmSelector, userFarmSelector } from '../../userFarmSlice';
import { productEntitiesSelector } from '../../productSlice';
import { setFormData } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { harvestUseTypesSelector } from '../../harvestUseTypeSlice';
import { useReadonlyTask } from './useReadonlyTask';
import { isTaskType } from '../useIsTaskType';
import { useMaxZoom } from '../../Map/useMaxZoom';

function TaskReadOnly({ history, match }) {
  const task_id = match.params.task_id;
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const task = useReadonlyTask(task_id);
  const products = useSelector(productEntitiesSelector);
  const users = useSelector(userFarmsByFarmSelector);
  const user = useSelector(userFarmSelector);
  const isAdmin = useSelector(isAdminSelector);
  const isTaskTypeCustom = !!task.taskType.farm_id;

  const selectedTaskType = task.taskType;
  const isHarvest = isTaskType(selectedTaskType, 'HARVEST_TASK');
  const harvestUseTypes = useSelector(harvestUseTypesSelector);

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
  const { maxZoomRef, getMaxZoom } = useMaxZoom();
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
      harvestUseTypes={harvestUseTypes}
      isTaskTypeCustom={isTaskTypeCustom}
      maxZoomRef={maxZoomRef}
      getMaxZoom={getMaxZoom}
    />
  );
}

export default TaskReadOnly;
