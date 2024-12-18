/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
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

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PureTaskReadOnly from '../../../components/Task/TaskReadOnly';
import {
  isAdminSelector,
  measurementSelector,
  userFarmsByFarmSelector,
  userFarmSelector,
} from '../../userFarmSlice';
import { productsForTaskTypeSelector } from '../../productSlice';
import { setFormData } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
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
  deleteTask,
} from '../saga';
import { useNavigate, useParams } from 'react-router-dom';

function TaskReadOnly({ location }) {
  let navigate = useNavigate();
  let { task_id } = useParams();
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const task = useReadonlyTask(task_id);
  const selectedTaskType = task?.taskType;
  const products = useSelector(productsForTaskTypeSelector(selectedTaskType));
  const users = useSelector(userFarmsByFarmSelector);
  const user = useSelector(userFarmSelector);
  const isAdmin = useSelector(isAdminSelector);
  const harvestUseTypes = useSelector(harvestUseTypesSelector);

  const [isTaskTypeCustom, setIsTaskTypeCustom] = useState(false);
  const [isHarvest, setIsHarvest] = useState(undefined);
  const [wageAtMoment, setWageAtMoment] = useState(undefined);
  const [hasAnimals, setHasAnimals] = useState(false);

  useEffect(() => {
    if (task === undefined) {
      navigate('/unknown_record', { replace: true });
    } else {
      setIsTaskTypeCustom(!!task.taskType.farm_id);
      setIsHarvest(isTaskType(task.taskType, 'HARVEST_TASK'));
      setWageAtMoment(task.wage_at_moment);
      setHasAnimals(task.animals?.length || task.animal_batches?.length);
    }
  }, [task, navigate]);

  const onGoBack = () => {
    navigate(-1);
  };

  const onComplete = () => {
    if (isHarvest) {
      navigate(`/tasks/${task_id}/complete_harvest_quantity`, { state: location?.state });
    } else if (isTaskTypeCustom && !hasAnimals) {
      dispatch(setFormData({ task_id, taskType: task.taskType }));
      navigate(`/tasks/${task_id}/complete`, { state: location?.state });
    } else {
      navigate(`/tasks/${task_id}/before_complete`, { state: location?.state });
    }
  };

  const onEdit = () => {
    // TODO - LF-1720 Edit task page
  };

  const onAbandon = () => {
    navigate(`/tasks/${task_id}/abandon`, { state: location?.state });
  };

  const onGoToCropPlan = () => {
    const { crop_variety_id, planting_management_plan } = task.managementPlans[0];
    const path = `/crop/${crop_variety_id}/management_plan/${planting_management_plan.management_plan_id}/tasks`;

    navigate(path, { state: location?.state });
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
    dispatch(deleteTask({ task_id }));
  };
  return (
    <>
      {task && (
        <PureTaskReadOnly
          task_id={task_id}
          onGoBack={onGoBack}
          onComplete={onComplete}
          onEdit={onEdit}
          onAbandon={onAbandon}
          onGoToCropPlan={onGoToCropPlan}
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
          wage_at_moment={wageAtMoment}
        />
      )}
    </>
  );
}

export default TaskReadOnly;
