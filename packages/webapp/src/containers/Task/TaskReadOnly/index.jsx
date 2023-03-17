/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PureTaskReadOnly from '../../../components/Task/TaskReadOnly';
import {
  isAdminSelector,
  measurementSelector,
  userFarmsByFarmSelector,
  userFarmSelector,
} from '../../userFarmSlice';
import { productsSelector } from '../../productSlice';
import {
  setFormData,
  setPersistedPaths,
} from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { harvestUseTypesSelector } from '../../harvestUseTypeSlice';
import { useReadonlyTask } from './useReadonlyTask';
import { isTaskType } from '../useIsTaskType';
import { useMaxZoom } from '../../Map/useMaxZoom';
import {
  assignTask,
  assignTasksOnDate,
  changeTaskDate,
  changeTaskWage,
  updateUserFarmWage,
  setUserFarmWageDoNotAskAgain,
} from '../saga';

function TaskReadOnly({ history, match, location }) {
  const task_id = match.params.task_id;
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const task = useReadonlyTask(task_id);
  const products = useSelector(productsSelector);
  const users = useSelector(userFarmsByFarmSelector).filter((user) => user.status !== 'Inactive');
  const user = useSelector(userFarmSelector);
  const isAdmin = useSelector(isAdminSelector);
  const isTaskTypeCustom = !!task.taskType.farm_id;

  const selectedTaskType = task.taskType;
  const isHarvest = isTaskType(selectedTaskType, 'HARVEST_TASK');
  const harvestUseTypes = useSelector(harvestUseTypesSelector);

  const onGoBack = () => {
    history.back();
  };

  const onComplete = () => {
    dispatch(
      setPersistedPaths([
        `/tasks/${task_id}/complete_harvest_quantity`,
        `/tasks/${task_id}/complete`,
        `/tasks/${task_id}/before_complete`,
        `/tasks/${task_id}/harvest_uses`,
      ]),
    );
    if (isHarvest) {
      history.push(`/tasks/${task_id}/complete_harvest_quantity`, location?.state);
    } else if (isTaskTypeCustom) {
      dispatch(setFormData({ task_id, taskType: task.taskType }));
      history.push(`/tasks/${task_id}/complete`, location?.state);
    } else {
      history.push(`/tasks/${task_id}/before_complete`, location?.state);
    }
  };

  const onEdit = () => {
    // TODO - LF-1720 Edit task page
  };

  const onAbandon = () => {
    history.push(`/tasks/${task_id}/abandon`, location?.state);
  };
  const { maxZoomRef, getMaxZoom } = useMaxZoom();

  const onChangeTaskDate = (date) =>
    dispatch(changeTaskDate({ task_id, due_date: date + 'T00:00:00.000' }));
  const onAssignTasksOnDate = (task) => dispatch(assignTasksOnDate(task));
  const onAssignTask = (task) => dispatch(assignTask(task));
  const onUpdateUserFarmWage = (user) => dispatch(updateUserFarmWage(user));
  const onSetUserFarmWageDoNotAskAgain = (user) => {
    dispatch(setUserFarmWageDoNotAskAgain(user));
  };
  const onChangeTaskWage = (wage) => {
    dispatch(changeTaskWage({ task_id, wage_at_moment: wage }));
  };

  const onDelete = () => {
    console.log('deleted task');
  };
  return (
    <>
      <PureTaskReadOnly
        task_id={task_id}
        onGoBack={onGoBack}
        onComplete={onComplete}
        onEdit={onEdit}
        onAbandon={onAbandon}
        onDelete={onDelete}
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
        onAssignTasksOnDate={onAssignTasksOnDate}
        onAssignTask={onAssignTask}
        onChangeTaskDate={onChangeTaskDate}
        onChangeTaskWage={onChangeTaskWage}
        onUpdateUserFarmWage={onUpdateUserFarmWage}
        onSetUserFarmWageDoNotAskAgain={onSetUserFarmWageDoNotAskAgain}
        wage_at_moment={task.wage_at_moment}
      />
    </>
  );
}

export default TaskReadOnly;
