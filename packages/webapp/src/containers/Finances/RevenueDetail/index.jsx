import React, { useState } from 'react';
import CropSaleForm from '../../../components/Forms/CropSale';
import ConfirmModal from '../../../components/Modals/Confirm';
import { deleteSale, updateSale } from '../actions';
import { selectedSaleSelector } from '../selectors';
import { userFarmSelector, measurementSelector } from '../../userFarmSlice';
import { revenueTypeSelector, revenueTypesSelector } from '../../revenueTypeSlice';
import { currentAndPlannedManagementPlansSelector } from '../../managementPlanSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useCurrencySymbol } from '../../hooks/useCurrencySymbol';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { revenueFormTypes as formTypes } from '../constants';
import { getRevenueFormType } from '../util';

function SaleDetail({ history, match }) {
  const { t } = useTranslation(['translation', 'revenue']);
  const dispatch = useDispatch();

  const managementPlans = useSelector(currentAndPlannedManagementPlansSelector) || [];
  const farm = useSelector(userFarmSelector);
  const system = useSelector(measurementSelector);
  const saleDetail = useSelector(selectedSaleSelector) || {};
  const revenueType = useSelector(revenueTypeSelector(saleDetail?.revenue_type_id));
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

  const [formType, setFormType] = useState(getRevenueFormType(revenueType));
  const [sale, setSale] = useState(saleDetail);

  const onTypeChange = (typeId) => {
    const newRevenueType = revenueTypes.find((type) => type.revenue_type_id === typeId);
    const newFormType = getRevenueFormType(newRevenueType);
    let updatedSale = sale;
    updatedSale.revenue_type_id = typeId;
    if (newFormType === formTypes.CROP_SALE) {
      setFormType(formTypes.CROP_SALE);
    }
    if (newFormType === formTypes.GENERAL) {
      setFormType(formTypes.GENERAL);
    }
    setSale(updatedSale);
  };

  const [showModal, setShowModal] = useState(false);

  const onSubmit = (data) => {
    const editedSale = {
      sale_id: sale.sale_id,
      customer_name: data.customer_name,
      sale_date: data.sale_date,
      farm_id: farm.farm_id,
      revenue_type_id: data.revenue_type_id.value,
      note: data.note ? data.note : null,
    };

    if (formType === formTypes.CROP_SALE) {
      editedSale.value = null;
      editedSale.crop_variety_sale = Object.values(data.crop_variety_sale).map((c) => {
        return {
          sale_value: c.sale_value,
          quantity: c.quantity,
          quantity_unit: c.quantity_unit.label,
          crop_variety_id: c.crop_variety_id,
        };
      });
    } else if (formType === formTypes.GENERAL) {
      editedSale.crop_variety_sale = null;
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

  return (
    <>
      <HookFormPersistProvider>
        <CropSaleForm
          cropVarietyOptions={cropVarietyOptions}
          system={system}
          managementPlans={managementPlans}
          formType={formType}
          onSubmit={onSubmit}
          title={t('SALE.EDIT_SALE.TITLE')}
          dateLabel={t('SALE.EDIT_SALE.DATE')}
          customerLabel={t('SALE.ADD_SALE.CUSTOMER_NAME')}
          currency={useCurrencySymbol()}
          sale={sale}
          onClickDelete={() => setShowModal(true)}
          revenueTypeOptions={revenueTypeReactSelectOptions}
          onTypeChange={onTypeChange}
          view="read-only"
        />
      </HookFormPersistProvider>
      <ConfirmModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => dispatch(deleteSale(sale))}
        message={t('SALE.EDIT_SALE.DELETE_CONFIRMATION')}
      />
    </>
  );
}

export default SaleDetail;
