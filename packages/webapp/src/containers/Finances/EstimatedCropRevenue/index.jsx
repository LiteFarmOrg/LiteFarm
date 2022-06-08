import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import FinanceGroup from '../../../components/Finances/FinanceGroup';
import { getManagementPlanTileDate } from '../../../util/moment';
import { cropVarietySelector } from '../../cropVarietySlice';
import { useTranslation } from 'react-i18next';
import { getTasksMinMaxDate } from '../../Task/getTasksMinMaxDate';
import { taskEntitiesByManagementPlanIdSelector } from '../../taskSlice';

const EstimatedCropRevenue = ({ cropVarietyId, managementPlans, history, ...props }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const cropVariety = useSelector(cropVarietySelector(cropVarietyId));
  const tasksByManagementPlanId = useSelector(taskEntitiesByManagementPlanIdSelector);

  const total = managementPlans.reduce((acc, plan) => {
    const { estimated_revenue } = plan;
    if (estimated_revenue) {
      return acc + estimated_revenue;
    }
    return acc;
  }, 0);

  const { crop } = cropVariety;
  const groupTitle = cropVariety.crop_variety_name
    ? `${cropVariety.crop_variety_name}, ${t(`crop:${crop.crop_translation_key}`)}`
    : t(`crop:${crop.crop_translation_key}`);

  return (
    <FinanceGroup
      headerTitle={groupTitle}
      totalAmount={total}
      financeItemsProps={managementPlans.map((plan) => {
        const tasks = tasksByManagementPlanId[plan.management_plan_id];
        const firstTaskDate = getTasksMinMaxDate(tasks).startDate;
        return {
          title: plan.name,
          subtitle: `${getManagementPlanTileDate(firstTaskDate)}`,
          amount: plan.estimated_revenue || 0,
          isPlan: true,
          onClickForward: () =>
            history.push(`/finances/estimated_revenue/plan/${plan.management_plan_id}`),
        };
      })}
      isDropDown
      {...props}
    />
  );
};

EstimatedCropRevenue.prototype = {
  isDropDown: PropTypes.bool,
};

export default EstimatedCropRevenue;
