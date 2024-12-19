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
import useCropSaleInputs from '../useCropSaleInputs';
import { addSale } from '../actions';
import { userFarmSelector } from '../../userFarmSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useCurrencySymbol } from '../../hooks/useCurrencySymbol';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { revenueTypeByIdSelector } from '../../revenueTypeSlice';
import { mapRevenueTypesToReactSelectOptions, mapRevenueFormDataToApiCallFormat } from '../util';
import useSortedRevenueTypes from '../AddSale/RevenueTypes/useSortedRevenueTypes';
import { useNavigate } from 'react-router-dom-v5-compat';

function AddSale() {
  let navigate = useNavigate();
  const { t } = useTranslation(['translation', 'revenue', 'common']);
  const dispatch = useDispatch();

  const farm = useSelector(userFarmSelector);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const { revenue_type_id } = persistedFormData || {};
  const revenueType = useSelector(revenueTypeByIdSelector(revenue_type_id));
  const revenueTypes = useSortedRevenueTypes();
  const revenueTypeReactSelectOptions = mapRevenueTypesToReactSelectOptions(revenueTypes);
  const translatedRevenueName = revenueType?.farm_id
    ? revenueType?.revenue_name
    : t(`revenue:${revenueType?.revenue_translation_key}.REVENUE_NAME`);

  const onSubmit = (data) => {
    const newSale = mapRevenueFormDataToApiCallFormat(data, revenueTypes, null, farm.farm_id);
    dispatch(addSale(newSale));
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <HookFormPersistProvider>
      <GeneralRevenue
        onSubmit={onSubmit}
        title={t('common:ADD_ITEM', {
          itemName: translatedRevenueName,
          interpolation: { escapeValue: false },
        })}
        currency={useCurrencySymbol()}
        useCustomFormChildren={useCropSaleInputs}
        view={'add'}
        handleGoBack={handleGoBack}
        buttonText={t('common:SAVE')}
        revenueTypes={revenueTypes}
        revenueTypeOptions={revenueTypeReactSelectOptions}
      />
    </HookFormPersistProvider>
  );
}

export default AddSale;
