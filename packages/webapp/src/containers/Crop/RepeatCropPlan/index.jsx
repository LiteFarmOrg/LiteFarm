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
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { cropSelector } from '../../cropSlice';
import { cropVarietiesSelector } from '../../cropVarietySlice';
import { postManagementPlanSaga } from '../saga';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';
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
  const dispatch = useDispatch();
  const crop_id = match.params.crop_id;

  const management_plan_id = match.params.management_plan_id;
  const plan = useSelector(managementPlanSelector(management_plan_id));

  const existingCropInfo = useSelector(cropSelector(crop_id));
  const { interested } = useSelector(certifierSurveySelector, shallowEqual);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const isNewCrop = crop_id === 'new';
  const crop = isNewCrop ? persistedFormData : existingCropInfo;
  const onError = (error) => {
    console.log(error);
  };
  const onContinue = (data) => {
    // history.push(`/crop/${crop_id}/add_crop_variety/compliance`);
    console.log('Submitted data:', data);
  };

  const farmCropVarieties = useSelector(cropVarietiesSelector);

  const farmManagementPlansForCropVariety = useSelector(
    managementPlansByCropVarietyIdSelector(plan.crop_variety_id),
  );

  const taskCardContents = useSelector(
    taskCardContentByManagementPlanSelector(plan.management_plan_id),
  );

  const onSubmit = (data) => {
    console.log('Submitting data', data);
  };

  const firstTaskDate = getDateInputFormat(taskCardContents[0].date);

  return (
    <HookFormPersistProvider>
      <PureRepeatCropPlan
        cropPlan={plan}
        farmManagementPlansForCrop={farmManagementPlansForCropVariety}
        origStartDate={firstTaskDate}
        onGoBack={() => history.back()}
        onContinue={onSubmit}
        fromCreation={location?.state?.fromCreation}
        persistedFormData={persistedFormData}
      />
    </HookFormPersistProvider>
  );
}

export default RepeatCropPlan;
