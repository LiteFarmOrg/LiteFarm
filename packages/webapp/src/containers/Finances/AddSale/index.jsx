import React from 'react';
import defaultStyles from '../styles.module.scss';
import SaleForm from '../../../components/Forms/Sale';
import { addOrUpdateSale } from '../actions';
import { userFarmSelector, measurementSelector } from '../../userFarmSlice';
import { currentAndPlannedManagementPlansSelector } from '../../managementPlanSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useCurrencySymbol } from '../../hooks/useCurrencySymbol';

function AddSale({}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const managementPlans = useSelector(currentAndPlannedManagementPlansSelector) || [];
  const farm = useSelector(userFarmSelector);
  const system = useSelector(measurementSelector);
  const onSubmit = (data) => {
    const crop_variety_sale = Object.values(data.crop_variety_sale).map((c) => {
      return {
        sale_value: c.sale_value,
        quantity: c.quantity,
        quantity_unit: c.quantity_unit.label,
        crop_variety_id: c.crop_variety_id,
      };
    });

    const addSale = {
      customer_name: data.customer_name,
      sale_date: data.sale_date,
      farm_id: farm.farm_id,
      crop_variety_sale: crop_variety_sale,
    };
    dispatch(addOrUpdateSale(addSale));
  };

  const getCropVarietyOptions = () => {
    if (!managementPlans || managementPlans.length === 0) {
      return;
    }

    let cropVarietyOptions = [];
    let cropVarietySet = new Set();

    for (let mp of managementPlans) {
      if (!cropVarietySet.has(mp.crop_variety_id)) {
        cropVarietyOptions.push({
          label: mp.crop_variety_name
            ? `${mp.crop_variety_name}, ${t(`crop:${mp.crop_translation_key}`)}`
            : t(`crop:${mp.crop_translation_key}`),
          value: mp.crop_variety_id,
        });
        cropVarietySet.add(mp.crop_variety_id);
      }
    }

    cropVarietyOptions.sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0));

    return cropVarietyOptions;
  };

  const cropVarietyOptions = getCropVarietyOptions() || [];

  return (
    <SaleForm
      cropVarietyOptions={cropVarietyOptions}
      onSubmit={onSubmit}
      title={t('SALE.ADD_SALE.TITLE')}
      dateLabel={t('SALE.ADD_SALE.DATE')}
      customerLabel={t('SALE.ADD_SALE.CUSTOMER_NAME')}
      system={system}
      currency={useCurrencySymbol()}
      managementPlans={managementPlans}
    />
  );
}

export default AddSale;
