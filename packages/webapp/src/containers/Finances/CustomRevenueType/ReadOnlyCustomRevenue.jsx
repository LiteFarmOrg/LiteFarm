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
import { CUSTOM_REVENUE_NAME, CROP_GENERATED } from './constants';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import CustomRevenueRadios from './CustomRevenueRadios';
import { createEditCustomRevenueUrl } from '../../../util/siteMapConstants';
import { useNavigate, useParams } from 'react-router-dom';

function ReadOnlyCustomRevenue() {
  let navigate = useNavigate();
  let { revenue_type_id } = useParams();
  const { t } = useTranslation(['translation', 'revenue', 'common']);
  const dispatch = useDispatch();
  const selectedCustomRevenueType = useSelector(revenueTypeByIdSelector(Number(revenue_type_id)));
  const { revenue_name, crop_generated, farm_id, custom_description, revenue_translation_key } =
    selectedCustomRevenueType;
  const translatedCustomDescription = farm_id
    ? custom_description
    : t(`revenue:${revenue_translation_key}.CUSTOM_DESCRIPTION`);
  const translatedRevenueName = farm_id
    ? revenue_name
    : t(`revenue:${revenue_translation_key}.REVENUE_NAME`);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    navigate(createEditCustomRevenueUrl(revenue_type_id));
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
        descriptionLabel={t('REVENUE.CUSTOM_REVENUE_DESCRIPTION')}
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
          [CROP_GENERATED]: crop_generated,
        }}
      />
    </HookFormPersistProvider>
  );
}

export default ReadOnlyCustomRevenue;
