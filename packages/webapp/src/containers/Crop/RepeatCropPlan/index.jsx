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
import PureRepeatCropPlan from '../../../components/RepeatCropPlan';
import { useSelector } from 'react-redux';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { useTranslation } from 'react-i18next';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import {
  managementPlanSelector,
  managementPlansByCropVarietyIdSelector,
} from '../../managementPlanSlice.js';
import { taskCardContentByManagementPlanSelector } from '../../Task/taskCardContentSelector';
import { getDateInputFormat } from '../../../util/moment';

function RepeatCropPlan({ history, match, location }) {
  const { t } = useTranslation(['translation']);

  const persistedFormData = useSelector(hookFormPersistSelector);

  const onContinue = (data) => {
    // history.push(`/crop/${crop_id}/add_crop_variety/compliance`);
    console.log('Submitted data:', data);
  };

  const management_plan_id = match.params.management_plan_id;
  const plan = useSelector(managementPlanSelector(management_plan_id));
  const farmManagementPlansForCropVariety = useSelector(
    managementPlansByCropVarietyIdSelector(plan.crop_variety_id),
  );

  const taskCardContents = useSelector(
    taskCardContentByManagementPlanSelector(plan.management_plan_id),
  );
  const sortedTaskCards = taskCardContents.sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });
  const firstTaskDate = getDateInputFormat(sortedTaskCards[0].date);

  return (
    <HookFormPersistProvider>
      <PureRepeatCropPlan
        cropPlan={plan}
        farmManagementPlansForCrop={farmManagementPlansForCropVariety}
        origStartDate={firstTaskDate}
        onGoBack={() => history.back()}
        onContinue={onContinue}
        fromCreation={location?.state?.fromCreation}
        persistedFormData={persistedFormData}
      />
    </HookFormPersistProvider>
  );
}

export default RepeatCropPlan;
