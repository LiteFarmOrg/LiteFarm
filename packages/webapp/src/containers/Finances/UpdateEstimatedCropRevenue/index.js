import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import PureUpdateEstimatedCropRevenue from '../../../components/Finances/UpdateEstimatedCropRevenue';
import { managementPlanSelector } from '../../managementPlanSlice';
import { measurementSelector } from '../../userFarmSlice';

function UpdateEstimatedCropRevenue({ history, match }) {
  const { management_plan_id } = match.params;
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const managementPlan = useSelector(managementPlanSelector(management_plan_id));
  const system = useSelector(measurementSelector);

  const onSubmit = (data) => {
    console.log(data);
    // const managementPlan = produce(data, (data) => {
    //   data.management_plan_id = management_plan_id;
    //   data.crop_management_plan &&
    //     (data.crop_management_plan.management_plan_id = management_plan_id);
    //   data.crop_variety_id = variety_id;
    // });
    // console.log(getProcessedFormData(managementPlan));
    // dispatch(patchManagementPlan(getProcessedFormData(managementPlan)));
  };

  return (
    <PureUpdateEstimatedCropRevenue
      system={system}
      plan={managementPlan}
      onGoBack={() => history.goBack()}
      onSubmit={onSubmit}
    />
  );
}

export default UpdateEstimatedCropRevenue;
