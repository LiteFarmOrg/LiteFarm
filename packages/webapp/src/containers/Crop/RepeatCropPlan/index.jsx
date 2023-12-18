/*
 *  Copyright 2023 LiteFarm.org
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
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import React, { useEffect } from 'react';
import PureRepeatCropPlan from '../../../components/RepeatCropPlan';
import { useSelector, useDispatch } from 'react-redux';
import {
  hookFormPersistSelector,
  setPersistedPaths,
} from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import {
  managementPlanSelector,
  managementPlansByCropVarietyIdSelector,
} from '../../managementPlanSlice.js';
import { tasksByManagementPlanIdSelector } from '../../taskSlice';
import { getDateInputFormat } from '../../../util/moment';

function RepeatCropPlan({ history, match }) {
  const dispatch = useDispatch();
  const { management_plan_id, variety_id } = match.params;
  useEffect(() => {
    dispatch(
      setPersistedPaths([
        `/crop/${variety_id}/management_plan/${management_plan_id}/repeat`,
        `/crop/${variety_id}/management_plan/${management_plan_id}/repeat_confirmation`,
      ]),
    );
  }, []);
  const persistedFormData = useSelector(hookFormPersistSelector);

  const plan = useSelector(managementPlanSelector(management_plan_id));

  const farmManagementPlansForCropVariety = useSelector(
    managementPlansByCropVarietyIdSelector(plan.crop_variety_id),
  );

  const tasks = useSelector(tasksByManagementPlanIdSelector(plan.management_plan_id));

  const sortedTasks = tasks.sort((a, b) => {
    return new Date(a.due_date) - new Date(b.due_date);
  });

  const firstTaskDate = getDateInputFormat(sortedTasks[0].complete_date || sortedTasks[0].due_date);

  const onContinue = () => {
    history.push(
      `/crop/${plan.crop_variety_id}/management_plan/${management_plan_id}/repeat_confirmation`,
      { origStartDate: firstTaskDate },
    );
  };

  return (
    <HookFormPersistProvider>
      <PureRepeatCropPlan
        cropPlan={plan}
        farmManagementPlansForCrop={farmManagementPlansForCropVariety}
        origStartDate={firstTaskDate}
        origStartDateType={sortedTasks[0].complete_date ? 'completion' : 'due'}
        onGoBack={() => history.back()}
        onContinue={onContinue}
        persistedFormData={persistedFormData}
      />
    </HookFormPersistProvider>
  );
}

export default RepeatCropPlan;
