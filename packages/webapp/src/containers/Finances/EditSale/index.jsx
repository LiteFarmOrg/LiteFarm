import React, { useState } from 'react';
import defaultStyles from '../styles.module.scss';
import CropSaleForm from '../../../components/Forms/CropSale';
import GeneralRevenueForm from '../../../components/Forms/GeneralRevenue';
import ConfirmModal from '../../../components/Modals/Confirm';
import { deleteSale, updateSale } from '../actions';
import { selectedSaleSelector } from '../selectors';
import { userFarmSelector, measurementSelector } from '../../userFarmSlice';
import { revenueTypeSelector } from '../../revenueTypeSlice';
import { currentAndPlannedManagementPlansSelector } from '../../managementPlanSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useCurrencySymbol } from '../../hooks/useCurrencySymbol';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { revenueFormTypes as formTypes } from '../constants';
import { getRevenueFormType } from '../util';

function EditSale({ history }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const managementPlans = useSelector(currentAndPlannedManagementPlansSelector) || [];
  const farm = useSelector(userFarmSelector);
  const system = useSelector(measurementSelector);
  const sale = useSelector(selectedSaleSelector) || {};
  const revenueType = useSelector(revenueTypeSelector(sale?.revenue_type_id));

  const formType = getRevenueFormType(revenueType);

  const [showModal, setShowModal] = useState(false);

  const onSubmit = (data) => {
    const editedSale = {
      sale_id: sale.sale_id,
      customer_name: data.customer_name,
      sale_date: data.sale_date,
      farm_id: farm.farm_id,
      revenue_type_id: data.revenue_type_id,
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
      editedSale.note = data.note;
      editedSale.value = data.value;
    }

    dispatch(updateSale(editedSale));
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

  const commonProps = {
    onSubmit,
    title: t('SALE.EDIT_SALE.TITLE'),
    dateLabel: t('SALE.EDIT_SALE.DATE'),
    customerLabel: t('SALE.ADD_SALE.CUSTOMER_NAME'),
    currency: useCurrencySymbol(),
    sale,
    onClickDelete: () => setShowModal(true),
  };

  return (
    <>
      {formType === formTypes.CROP_SALE ? (
        <CropSaleForm
          {...commonProps}
          cropVarietyOptions={cropVarietyOptions}
          system={system}
          managementPlans={managementPlans}
        />
      ) : (
        <HookFormPersistProvider>
          <GeneralRevenueForm {...commonProps} />
        </HookFormPersistProvider>
      )}
      <ConfirmModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => dispatch(deleteSale(sale))}
        message={t('SALE.EDIT_SALE.DELETE_CONFIRMATION')}
      />
    </>
  );
}

export default EditSale;
