import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import FinanceGroup from '../../../components/Finances/FinanceGroup';
import { getManagementPlanCardDate, getManagementPlanTileDate } from '../../../util/moment';
import { cropVarietyEntitiesSelector, cropVarietySelector } from '../../cropVarietySlice';
import { setSelectedSale } from '../actions';
import { convertFromMetric, roundToTwoDecimal } from '../../../util';
import { useTranslation } from 'react-i18next';

const EstimatedCropRevenue = ({ cropVarietyId, plans, history, ...props }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const cropVariety = useSelector(cropVarietySelector(cropVarietyId));

  let total = 0;
  for (const plan of plans) {
    total += plan.estimated_revenue;
  }

  const { crop } = cropVariety;
  const groupTitle = cropVariety.crop_variety_name
    ? `${cropVariety.crop_variety_name}, ${t(`crop:${crop.crop_translation_key}`)}`
    : t(`crop:${crop.crop_translation_key}`);

  return (
    <FinanceGroup
      headerTitle={groupTitle}
      totalAmount={total}
      financeItemsProps={plans.map((plan) => {
        // TODO: set proper subtitle and pass onclick
        return {
          title: plan.name,
          subtitle: `first task date how to get | bed notes?`,
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
