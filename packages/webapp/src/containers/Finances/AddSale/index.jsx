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

import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import GeneralRevenue from '../../../components/Forms/GeneralRevenue';
import { useAddSaleMutation, useGetRevenueTypesQuery } from '../../../store/api/apiSlice';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../../Snackbar/snackbarSlice';
import { useCurrencySymbol } from '../../hooks/useCurrencySymbol';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { userFarmSelector } from '../../userFarmSlice';
import useSortedRevenueTypes from '../AddSale/RevenueTypes/useSortedRevenueTypes';
import useCropSaleInputs from '../useCropSaleInputs';
import { mapRevenueFormDataToApiCallFormat, mapRevenueTypesToReactSelectOptions } from '../util';

function AddSale({ history }) {
  const { t } = useTranslation(['translation', 'revenue', 'common']);
  const dispatch = useDispatch();

  const farm = useSelector(userFarmSelector);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const { revenue_type_id } = persistedFormData || {};
  const { revenueType } = useGetRevenueTypesQuery(farm.farm_id, {
    selectFromResult: ({ data }) => ({
      revenueType: data?.find((type) => type.revenue_type_id === revenue_type_id),
    }),
  });
  const revenueTypes = useSortedRevenueTypes();
  const revenueTypeReactSelectOptions = mapRevenueTypesToReactSelectOptions(revenueTypes);
  const translatedRevenueName = revenueType?.farm_id
    ? revenueType?.revenue_name
    : t(`revenue:${revenueType?.revenue_translation_key}.REVENUE_NAME`);
  const [addSale] = useAddSaleMutation();

  const onSubmit = async (data) => {
    const newSale = mapRevenueFormDataToApiCallFormat(data, revenueTypes, null, farm.farm_id);
    try {
      await addSale(newSale).unwrap();
      dispatch(enqueueSuccessSnackbar(t('message:SALE.SUCCESS.ADD')));
      history.push('/finances');
    } catch (e) {
      console.log(e);
      dispatch(enqueueErrorSnackbar(t('message:SALE.ERROR.ADD')));
    }
  };

  const handleGoBack = () => {
    history.back();
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
