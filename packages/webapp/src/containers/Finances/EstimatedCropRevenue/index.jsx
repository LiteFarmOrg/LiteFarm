import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import FinanceGroup from '../../../components/Finances/FinanceGroup';
import { getManagementPlanTileDate } from '../../../util/moment';
import { cropVarietySelector } from '../../cropVarietySlice';
import { useTranslation } from 'react-i18next';
import { getTasksMinMaxDate } from '../../Task/getTasksMinMaxDate';
import { taskEntitiesByManagementPlanIdSelector } from '../../taskSlice';
import { createManagementPlanEstimatedRevenueURL } from '../../../util/siteMapConstants';
import { useNavigate } from 'react-router-dom';

const EstimatedCropRevenue = ({ cropVarietyId, managementPlans, ...props }) => {
  let navigate = useNavigate();
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
            navigate(createManagementPlanEstimatedRevenueURL(plan.management_plan_id)),
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
