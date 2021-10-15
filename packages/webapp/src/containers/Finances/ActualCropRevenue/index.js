import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import FinanceGroup from '../../../components/Finances/FinanceGroup';
import { getManagementPlanCardDate } from '../../../util/moment';
import { cropVarietyEntitiesSelector } from '../../cropVarietySlice';
import { setSelectedSale } from '../actions';
import { convertFromMetric, roundToTwoDecimal } from '../../../util';

const ActualCropRevenue = ({ sale, history, ...props }) => {
  const { sale_id, sale_date, customer_name, crop_variety_sale } = sale;

  const dispatch = useDispatch();

  // TODO: optimize this - put in parent component or seek by id
  const cropVarietyEntities = useSelector(cropVarietyEntitiesSelector);

  let total = 0;
  for (const cvs of crop_variety_sale) {
    total += cvs.sale_value;
  }

  const onClickForward = () => {
    dispatch(setSelectedSale(sale));
    history.push(`/edit_sale`);
  };

  return (
    <FinanceGroup
      headerTitle={getManagementPlanCardDate(sale_date)}
      headerSubtitle={customer_name}
      headerClickForward={onClickForward}
      totalAmount={total}
      financeItemsProps={crop_variety_sale.map((cvs) => {
        const convertedQuantity = roundToTwoDecimal(
          convertFromMetric(cvs.quantity.toString(), cvs.quantity_unit, 'kg').toString(),
        );
        return {
          title: cropVarietyEntities[cvs.crop_variety_id].crop_variety_name,
          subtitle: `${convertedQuantity} ${cvs.quantity_unit}`,
          amount: cvs.sale_value,
        };
      })}
      {...props}
    />
  );
};

ActualCropRevenue.prototype = {
  isDropDown: PropTypes.bool,
};

export default ActualCropRevenue;
