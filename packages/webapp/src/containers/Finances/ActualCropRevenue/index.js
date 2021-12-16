import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import FinanceGroup from '../../../components/Finances/FinanceGroup';
import { getManagementPlanCardDate } from '../../../util/moment';
import { cropVarietiesSelector } from '../../cropVarietySlice';
import { setSelectedSale } from '../actions';
import { convertFromMetric, roundToTwoDecimal } from '../../../util';
import { useTranslation } from 'react-i18next';

const ActualCropRevenue = ({ sale, history, ...props }) => {
  const { sale_id, sale_date, customer_name, crop_variety_sale } = sale;

  const dispatch = useDispatch();
  const { t } = useTranslation();

  // TODO: optimize this - put in parent component or seek by id
  const cropVarietyEntities = {};
  const cropVarieties= useSelector(cropVarietiesSelector);

  let total = 0;
  for (const cvs of crop_variety_sale) {
    total += cvs.sale_value;
    cropVarietyEntities[cvs.crop_variety_id] = cropVarieties.filter(
      (c) => c.crop_variety_id === cvs.crop_variety_id
    )[0]
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
        const cropVariety =  cropVarietyEntities[cvs.crop_variety_id];
        const title = cropVariety.crop_variety_name
          ? `${cropVariety.crop_variety_name}, ${t(`crop:${cropVariety.crop.crop_translation_key}`)}`
          : t(`crop:${cropVariety.crop.crop_translation_key}`);

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
