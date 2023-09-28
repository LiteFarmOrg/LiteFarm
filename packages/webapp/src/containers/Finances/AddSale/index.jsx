import React from 'react';
import CropSaleForm from '../../../components/Forms/CropSale';
import { addSale } from '../actions';
import { userFarmSelector, measurementSelector } from '../../userFarmSlice';
import { currentAndPlannedManagementPlansSelector } from '../../managementPlanSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useCurrencySymbol } from '../../hooks/useCurrencySymbol';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { revenueTypeSelector, revenueTypesSelector } from '../../revenueTypeSlice';
import { getRevenueFormType } from '../util';
import { revenueFormTypes as formTypes } from '../constants';

function AddSale() {
  const { t } = useTranslation(['translation', 'revenue']);
  const dispatch = useDispatch();

  const managementPlans = useSelector(currentAndPlannedManagementPlansSelector) || [];
  const farm = useSelector(userFarmSelector);
  const system = useSelector(measurementSelector);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const { revenue_type_id } = persistedFormData || {};
  const revenueType = useSelector(revenueTypeSelector(revenue_type_id));
  const revenueTypes = useSelector(revenueTypesSelector);

  // Dropdown should include the current expense's type even if it has been retired
  const revenueTypesArray = revenueTypes?.concat(revenueType?.deleted ? revenueType : []);

  const revenueTypeReactSelectOptions = revenueTypesArray?.map((type) => {
    const retireSuffix = type.deleted ? ` ${t('REVENUE.EDIT_REVENUE.RETIRED')}` : '';

    return {
      value: type.revenue_type_id,
      label: type.farm_id
        ? type.revenue_name + retireSuffix
        : t(`revenue:${type.revenue_translation_key}`),
    };
  });

  const formType = getRevenueFormType(revenueType);

  const onSubmit = (data) => {
    const editedSale = {
      customer_name: data.customer_name,
      sale_date: data.sale_date,
      farm_id: farm.farm_id,
      revenue_type_id: revenue_type_id,
      note: data.note ? data.note : null,
    };

    if (formType === formTypes.CROP_SALE) {
      editedSale.crop_variety_sale = Object.values(data.crop_variety_sale).map((c) => {
        return {
          sale_value: c.sale_value,
          quantity: c.quantity,
          quantity_unit: c.quantity_unit.label,
          crop_variety_id: c.crop_variety_id,
        };
      });
    } else if (formType === formTypes.GENERAL) {
      editedSale.value = data.value;
    }

    dispatch(addSale(editedSale));
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
  const title =
    formType === formTypes.GENERAL
      ? t('common:ADD_ITEM', { itemName: revenueType.revenue_name })
      : t('SALE.ADD_SALE.TITLE');
  return (
    <HookFormPersistProvider>
      <CropSaleForm
        onSubmit={onSubmit}
        dateLabel={t('SALE.ADD_SALE.DATE')}
        customerLabel={t('SALE.ADD_SALE.CUSTOMER_NAME')}
        currency={useCurrencySymbol()}
        cropVarietyOptions={cropVarietyOptions}
        revenueTypeOptions={revenueTypeReactSelectOptions}
        system={system}
        managementPlans={managementPlans}
        view="add"
        title={title}
        formType={formType}
        buttonText={t('common:SAVE')}
      />
    </HookFormPersistProvider>
  );
}

export default AddSale;
