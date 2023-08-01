/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (saga.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import PureCompleteOnCreation from '../../../components/Task/TaskComplete/CompleteOnCreation';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { userFarmSelector } from '../../userFarmSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { taskWithProductSelector } from '../../taskSlice';
import { productsSelector } from '../../productSlice';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';
import {
  setPersistedPaths,
  setFormData,
} from '../../hooks/useHookFormPersist/hookFormPersistSlice';

function TaskCompleteOnCreation({ history, match, location }) {
  const {
    units: { measurement: system },
    country_id,
  } = useSelector(userFarmSelector);
  const { interested, farm_id } = useSelector(certifierSurveySelector, shallowEqual);
  const task_id = match.params.task_id;
  const task = useSelector(taskWithProductSelector(task_id));
  const selectedTaskType = task.taskType;
  const products = useSelector(productsSelector);
  const persistedPaths = [`/tasks/${task_id}/before_complete`];
  const dispatch = useDispatch();

  const onContinue = (data) => {
    dispatch(
      setPersistedPaths([
        `/tasks/${task_id}/complete_harvest_quantity`,
        `/tasks/${task_id}/complete`,
        `/tasks/${task_id}/before_complete`,
        `/tasks/${task_id}/harvest_uses`,
      ]),
    );
    if (selectedTaskType.task_translation_key == 'HARVEST_TASK') {
      history.push(`/tasks/${task_id}/complete_harvest_quantity`, location?.state);
    } else if (selectedTaskType.farm_id == farm_id) {
      dispatch(setFormData({ task_id, taskType: task.taskType }));
      history.push(`/tasks/${task_id}/complete`, location?.state);
    } else {
      history.push(`/tasks/${task_id}/before_complete`, location?.state);
    }
  };

  const onGoBack = () => {
    history.push('/tasks');
  };

  return (
    <HookFormPersistProvider>
      <PureCompleteOnCreation onContinue={onContinue} onGoBack={onGoBack} selectedTask={task} />
    </HookFormPersistProvider>
  );
}

export default TaskCompleteOnCreation;
