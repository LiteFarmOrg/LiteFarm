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

import PureSimpleCustomType from '../../../components/Forms/SimpleCustomType';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { deleteRevenueType } from '../saga';
import { revenueTypeByIdSelector } from '../../revenueTypeSlice';
import { CUSTOM_REVENUE_NAME, AGRICULTURE_ASSOCIATED, CROP_GENERATED } from './constants';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import CustomRevenueRadios from './CustomRevenueRadios';

function ReadOnlyCustomRevenue({ history, match }) {
  const { revenue_type_id } = match.params;
  const { t } = useTranslation(['translation', 'revenue', 'common']);
  const dispatch = useDispatch();
  const selectedCustomRevenueType = useSelector(revenueTypeByIdSelector(Number(revenue_type_id)));
  const {
    revenue_name,
    agriculture_associated,
    crop_generated,
    farm_id,
    custom_description,
    revenue_translation_key,
  } = selectedCustomRevenueType;
  const translatedCustomDescription = farm_id
    ? custom_description
    : t(`revenue:${revenue_translation_key}.CUSTOM_DESCRIPTION`);
  const translatedRevenueName = farm_id
    ? revenue_name
    : t(`revenue:${revenue_translation_key}.REVENUE_NAME`);

  const handleGoBack = () => {
    history.back();
  };

  const handleEdit = () => {
    history.push(`/edit_custom_revenue/${revenue_type_id}`);
  };

  const onRetire = () => {
    dispatch(deleteRevenueType(Number(revenue_type_id)));
  };

  return (
    <HookFormPersistProvider>
      <PureSimpleCustomType
        handleGoBack={handleGoBack}
        onClick={handleEdit}
        view="read-only"
        buttonText={t('common:EDIT')}
        pageTitle={t('REVENUE.ADD_REVENUE.CUSTOM_REVENUE_TYPE')}
        inputLabel={t('REVENUE.ADD_REVENUE.CUSTOM_REVENUE_NAME')}
        nameFieldRegisterName={CUSTOM_REVENUE_NAME}
        typeDetails={{ name: translatedRevenueName, description: translatedCustomDescription }}
        onRetire={onRetire}
        retireLinkText={t('REVENUE.EDIT_REVENUE.RETIRE_REVENUE_TYPE')}
        retireHeader={t('REVENUE.EDIT_REVENUE.RETIRE_REVENUE_TYPE')}
        retireMessage={t('REVENUE.EDIT_REVENUE.RETIRE_REVENUE_MESSAGE')}
        customFormFields={({ control, watch }) => (
          <CustomRevenueRadios control={control} watch={watch} view="read-only" />
        )}
        customFieldsDefaultValues={{
          [AGRICULTURE_ASSOCIATED]: agriculture_associated,
          [CROP_GENERATED]: crop_generated,
        }}
      />
    </HookFormPersistProvider>
  );
}

export default ReadOnlyCustomRevenue;
