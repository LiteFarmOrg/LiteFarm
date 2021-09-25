import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import FinanceGroup from '../../../components/Finances/FinanceGroup';
import { getManagementPlanCardDate } from '../../../util/moment';
import { cropVarietyEntitiesSelector } from '../../cropVarietySlice';

const ActualCropRevenue = ({ sale, ...props }) => {
  const { sale_id, sale_date, customer_name, crop_variety_sale } = sale;

  // TODO: optimize this - put in parent component or something similar
  const cropVarietyEntities = useSelector(cropVarietyEntitiesSelector);

  let total = 0;
  for (const cvs of crop_variety_sale) {
    total += cvs.sale_value;
  }

  return (
    <FinanceGroup
      headerTitle={getManagementPlanCardDate(sale_date)}
      headerSubtitle={customer_name}
      headerClickForward={() => {
        console.log(`edit sale id ${sale_id}`);
      }}
      totalAmount={total}
      financeItemsProps={crop_variety_sale.map((cvs) => {
        return {
          title: cropVarietyEntities[cvs.crop_variety_id].crop_variety_name,
          // TODO: convert quantity
          subtitle: `${cvs.quantity} ${cvs.quantity_unit}`,
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
