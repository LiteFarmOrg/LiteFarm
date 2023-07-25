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

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PureRepeatCropPlanConfirmation from '../../../components/RepeatCropPlan/Confirmation';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { tasksByManagementPlanIdSelector } from '../../taskSlice';
import { postRepeatCropPlan } from '../saga';

function RepeatCropPlanConfirmation({ history, match }) {
  const persistedFormData = useSelector(hookFormPersistSelector);

  const { management_plan_id, variety_id } = match.params;
  const tasks = useSelector(tasksByManagementPlanIdSelector(management_plan_id));
  const dispatch = useDispatch();

  const onSubmit = (occurrences) => {
    dispatch(
      postRepeatCropPlan({
        crop_variety_id: variety_id,
        management_plan_id,
        startDates: occurrences,
        repeatDetails: persistedFormData,
      }),
    );
  };

  return (
    <HookFormPersistProvider>
      <PureRepeatCropPlanConfirmation
        onGoBack={() => history.back()}
        onSubmit={onSubmit}
        persistedFormData={persistedFormData}
        tasks={tasks}
      />
    </HookFormPersistProvider>
  );
}

export default RepeatCropPlanConfirmation;
