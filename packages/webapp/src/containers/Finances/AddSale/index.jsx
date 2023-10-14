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

import React from 'react';
import GeneralRevenue from '../../../components/Forms/GeneralRevenue';
import { useCropSaleInputs } from '../useCropSaleInputs';
import { addSale } from '../actions';
import { userFarmSelector } from '../../userFarmSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useCurrencySymbol } from '../../hooks/useCurrencySymbol';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { revenueTypeByIdSelector } from '../../revenueTypeSlice';
import { getRevenueFormType } from '../util';
import { revenueFormTypes as formTypes } from '../constants';

function AddSale() {
  const { t } = useTranslation(['translation', 'revenue']);
  const dispatch = useDispatch();

  const farm = useSelector(userFarmSelector);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const { revenue_type_id } = persistedFormData || {};
  const revenueType = useSelector(revenueTypeByIdSelector(revenue_type_id));

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

  const handleGoBack = () => {
    history.back();
  };

  return (
    <HookFormPersistProvider>
      <GeneralRevenue
        onSubmit={onSubmit}
        title={t('common:ADD_ITEM', { itemName: revenueType?.revenue_name })}
        currency={useCurrencySymbol()}
        useCustomFormChildren={useCropSaleInputs}
        view={'add'}
        handleGoBack={handleGoBack}
        buttonText={t('common:SAVE')}
        formType={formType}
      />
    </HookFormPersistProvider>
  );
}

export default AddSale;
