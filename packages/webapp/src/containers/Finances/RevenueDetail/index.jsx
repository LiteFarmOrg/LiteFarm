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

import { useEffect } from 'react';
import { deleteSale, updateSale } from '../actions';
import { revenueByIdSelector } from '../selectors';
import { revenueTypeByIdSelector } from '../../revenueTypeSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useCurrencySymbol } from '../../hooks/useCurrencySymbol';
import { setPersistedPaths } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import GeneralRevenue from '../../../components/Forms/GeneralRevenue';
import useCropSaleInputs, { getCustomFormChildrenDefaultValues } from '../useCropSaleInputs';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { mapRevenueFormDataToApiCallFormat, mapRevenueTypesToReactSelectOptions } from '../util';
import useSortedRevenueTypes from '../AddSale/RevenueTypes/useSortedRevenueTypes';
import { REVENUE_TYPE_OPTION } from '../../../components/Forms/GeneralRevenue/constants';
import { createEditRevenueDetailsUrl } from '../../../util/siteMapConstants';
import { useLocation, useNavigate, useParams } from 'react-router-dom-v5-compat';

function RevenueDetail() {
  let navigate = useNavigate();
  let location = useLocation();
  const isEditing = location.pathname.endsWith('/edit');
  const { sale_id } = useParams();

  // To clear form history after editing
  useHookFormPersist();
  const { t } = useTranslation(['translation', 'revenue']);
  const dispatch = useDispatch();
  const revenueTypes = useSortedRevenueTypes();
  const sale = useSelector(revenueByIdSelector(sale_id));
  const revenueType = useSelector(revenueTypeByIdSelector(sale?.revenue_type_id));

  useEffect(() => {
    if (!sale) {
      navigate('/unknown_record', { replace: true });
    }
  }, [sale, navigate]);

  // Dropdown should include the current revenue's type even if it has been retired
  const revenueTypesArray = revenueTypes?.concat(revenueType?.retired ? revenueType : []);
  const revenueTypeReactSelectOptions = mapRevenueTypesToReactSelectOptions(revenueTypesArray);

  const onSubmit = (data) => {
    const editedSale = mapRevenueFormDataToApiCallFormat(data, revenueTypes, sale_id, null);
    dispatch(updateSale(editedSale));
  };

  const handleEdit = () => {
    dispatch(setPersistedPaths([createEditRevenueDetailsUrl(sale_id)]));
    navigate(createEditRevenueDetailsUrl(sale_id));
  };

  const onRetire = () => {
    dispatch(deleteSale(sale_id));
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const onTypeChange = (typeId, setValue) => {
    const newType = revenueTypeReactSelectOptions?.find((option) => option.value === typeId);
    setValue(REVENUE_TYPE_OPTION, newType);
  };

  return (
    <GeneralRevenue
      key={isEditing ? 'editing' : 'readonly'}
      onSubmit={isEditing ? onSubmit : undefined}
      title={isEditing ? t('SALE.EDIT_SALE.TITLE') : t('SALE.DETAIL.TITLE')}
      currency={useCurrencySymbol()}
      sale={sale}
      useCustomFormChildren={useCropSaleInputs}
      customFormChildrenDefaultValues={
        revenueType?.crop_generated ? getCustomFormChildrenDefaultValues(sale) : undefined
      }
      view={isEditing ? 'edit' : 'read-only'}
      handleGoBack={handleGoBack}
      onClick={isEditing ? undefined : handleEdit}
      revenueTypeOptions={revenueTypeReactSelectOptions}
      onTypeChange={onTypeChange}
      buttonText={isEditing ? t('common:SAVE') : t('common:EDIT')}
      onRetire={onRetire}
      revenueTypes={revenueTypesArray}
    />
  );
}

export default RevenueDetail;
