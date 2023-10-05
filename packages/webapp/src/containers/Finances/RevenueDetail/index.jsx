import React, { useState, useEffect } from 'react';
import CropSaleForm from '../../../components/Forms/CropSale';
import { deleteSale, updateSale } from '../actions';
import { revenueByIdSelector } from '../selectors';
import { measurementSelector } from '../../userFarmSlice';
import { revenueTypeByIdSelector } from '../../revenueTypeSlice';
import { currentAndPlannedManagementPlansSelector } from '../../managementPlanSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useCurrencySymbol } from '../../hooks/useCurrencySymbol';
import { setPersistedPaths } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { revenueFormTypes as formTypes } from '../constants';
import { getRevenueFormType } from '../util';
import useSortedRevenueTypes from '../AddSale/RevenueTypes/useSortedRevenueTypes';
import GeneralRevenue from '../../../components/Forms/GeneralRevenue';
import { getCustomFormChildrenDefaultValues } from '../../../components/Forms/CropSale/useCropSaleInputs';
import { useCropSaleInputs } from '../../../components/Forms/CropSale/useCropSaleInputs';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { revenueTypeTileContentsSelector } from '../../revenueTypeSlice';

function SaleDetail({ history, match }) {
  const { t } = useTranslation(['translation', 'revenue']);
  const dispatch = useDispatch();

  useHookFormPersist();

  const isEditing = match.path.endsWith('/edit');
  const { sale_id } = match.params;

  const revenueTypes = useSelector(revenueTypeTileContentsSelector);
  //const revenueTypes = useSortedRevenueTypes();
  const sale = useSelector(revenueByIdSelector(sale_id));

  useEffect(() => {
    if (!sale) {
      history.replace('/unknown_record');
    }
  }, [sale, history]);

  const revenueType = useSelector(revenueTypeByIdSelector(sale.revenue_type_id));

  // Dropdown should include the current revenue's type even if it has been retired
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

  const onSubmit = (data) => {
    let editedSale = {
      sale_id: sale_id,
      customer_name: data.customer_name,
      sale_date: data.sale_date,
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

  const handleEdit = () => {
    dispatch(setPersistedPaths([`/revenue/${sale_id}/edit`]));
    history.push(`/revenue/${sale_id}/edit`);
  };

  const onRetire = () => {
    dispatch(deleteSale(sale_id));
  };

  const handleGoBack = () => {
    history.back();
  };

  // Review after merging LF-3595
  // Handles changing the type
  const [formType, setFormType] = useState(getRevenueFormType(revenueType));

  const onTypeChange = (typeId, setValue, REVENUE_TYPE_ID) => {
    const newType = revenueTypeReactSelectOptions?.find((option) => option.value === typeId);
    setValue(REVENUE_TYPE_ID, newType);
    const newRevenueType = revenueTypes.find((type) => type.revenue_type_id === typeId);
    const newFormType = getRevenueFormType(newRevenueType);
    if (newFormType === formTypes.CROP_SALE) {
      setFormType(formTypes.CROP_SALE);
    }
    if (newFormType === formTypes.GENERAL) {
      setFormType(formTypes.GENERAL);
    }
  };
  return (
    <GeneralRevenue
      key={isEditing ? 'editing' : 'readonly'}
      onSubmit={isEditing ? onSubmit : undefined}
      title={t('SALE.EDIT_SALE.TITLE')}
      currency={useCurrencySymbol()}
      sale={sale}
      customFormChildren={useCropSaleInputs}
      customFormChildrenDefaultValues={
        formType === formTypes.CROP_SALE ? getCustomFormChildrenDefaultValues(sale) : undefined
      }
      view={isEditing ? 'edit' : 'read-only'}
      handleGoBack={handleGoBack}
      onClick={isEditing ? undefined : handleEdit}
      revenueTypeOptions={revenueTypeReactSelectOptions}
      onTypeChange={onTypeChange}
      buttonText={isEditing ? t('common:SAVE') : t('common:EDIT')}
      formType={formType}
      onRetire={onRetire}
    />
  );
}

export default SaleDetail;
