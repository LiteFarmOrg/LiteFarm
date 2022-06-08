import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import produce from 'immer';
import PureUpdateEstimatedCropRevenue from '../../../components/Finances/UpdateEstimatedCropRevenue';
import { managementPlanSelector } from '../../managementPlanSlice';
import { measurementSelector } from '../../userFarmSlice';
import { getProcessedFormData } from '../../hooks/useHookFormPersist/utils';
import { patchEstimatedCropRevenue } from '../saga';

function UpdateEstimatedCropRevenue({ history, match }) {
  const { management_plan_id } = match.params;
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const managementPlan = useSelector(managementPlanSelector(management_plan_id));
  const system = useSelector(measurementSelector);

  const { crop_variety_id } = managementPlan;

  const onSubmit = (data) => {
    const managementPlan = produce(data, (data) => {
      data.management_plan_id = management_plan_id;
      data.crop_management_plan &&
        (data.crop_management_plan.management_plan_id = management_plan_id);
      data.crop_variety_id = crop_variety_id;
    });
    dispatch(patchEstimatedCropRevenue(getProcessedFormData(managementPlan)));
  };

  return (
    <PureUpdateEstimatedCropRevenue
      system={system}
      managementPlan={managementPlan}
      onGoBack={() => history.back()}
      onSubmit={onSubmit}
    />
  );
}

export default UpdateEstimatedCropRevenue;
