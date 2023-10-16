/*
 *  Copyright 2023 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import React, { useState, useEffect } from 'react';
import { deleteSale, updateSale } from '../actions';
import { revenueByIdSelector } from '../selectors';
import { revenueTypeByIdSelector } from '../../revenueTypeSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useCurrencySymbol } from '../../hooks/useCurrencySymbol';
import { setPersistedPaths } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import useSortedRevenueTypes from '../AddSale/RevenueTypes/useSortedRevenueTypes';
import GeneralRevenue from '../../../components/Forms/GeneralRevenue';
import useCropSaleInputs, { getCustomFormChildrenDefaultValues } from '../useCropSaleInputs';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { revenueTypeTileContentsSelector } from '../../revenueTypeSlice';

function SaleDetail({ history, match }) {
  const isEditing = match.path.endsWith('/edit');
  const { sale_id } = match.params;

  // To clear form history after editing
  useHookFormPersist();
  const { t } = useTranslation(['translation', 'revenue']);
  const dispatch = useDispatch();

  const revenueTypes = useSelector(revenueTypeTileContentsSelector);
  // Doesnt populate unless used with hook form persist (but consider adding back persist because while this form doesnt need to persist -- others might want to)
  // const revenueTypes = useSortedRevenueTypes();
  const sale = useSelector(revenueByIdSelector(sale_id));
  const revenueType = useSelector(revenueTypeByIdSelector(sale?.revenue_type_id));

  // Review after merging LF-3595
  // Handles changing the type
  const [selectedRevenueType, setSelectedRevenueType] = useState(revenueType);
  useEffect(() => {
    if (!sale) {
      history.replace('/unknown_record');
    }
  }, [sale, history]);

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
    const newRevenueType = revenueTypes.find(
      (type) => type.revenue_type_id === data.revenue_type_id.value,
    );
    if (newRevenueType.crop_generated) {
      editedSale.value = null;
      editedSale.crop_variety_sale = Object.values(data.crop_variety_sale).map((c) => {
        return {
          sale_value: c.sale_value,
          quantity: c.quantity,
          quantity_unit: c.quantity_unit.label,
          crop_variety_id: c.crop_variety_id,
        };
      });
    } else if (!newRevenueType.crop_generated) {
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

  const onTypeChange = (typeId, setValue, REVENUE_TYPE_ID) => {
    const newType = revenueTypeReactSelectOptions?.find((option) => option.value === typeId);
    setValue(REVENUE_TYPE_ID, newType);
    const revenueType = revenueTypes.find((type) => type.revenue_type_id === typeId);
    setSelectedRevenueType(revenueType);
  };

  return (
    <GeneralRevenue
      key={isEditing ? 'editing' : 'readonly'}
      onSubmit={isEditing ? onSubmit : undefined}
      title={t('SALE.EDIT_SALE.TITLE')}
      currency={useCurrencySymbol()}
      sale={sale}
      useCustomFormChildren={useCropSaleInputs}
      customFormChildrenDefaultValues={
        revenueType.crop_generated ? getCustomFormChildrenDefaultValues(sale) : undefined
      }
      view={isEditing ? 'edit' : 'read-only'}
      handleGoBack={handleGoBack}
      onClick={isEditing ? undefined : handleEdit}
      revenueTypeOptions={revenueTypeReactSelectOptions}
      onTypeChange={onTypeChange}
      buttonText={isEditing ? t('common:SAVE') : t('common:EDIT')}
      onRetire={onRetire}
      revenueType={selectedRevenueType}
      revenueTypes={revenueTypesArray}
    />
  );
}

export default SaleDetail;
