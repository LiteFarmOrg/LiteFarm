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
import { updateCustomRevenueType } from '../saga';
import { revenueTypeByIdSelector, allRevenueTypesSelector } from '../../revenueTypeSlice';
import { CUSTOM_REVENUE_NAME, CROP_GENERATED } from './constants';
import { hookFormUniquePropertyWithStatusValidation } from '../../../components/Form/hookformValidationUtils';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import CustomRevenueRadios from './CustomRevenueRadios';

function EditCustomRevenue({ history, match }) {
  const { revenue_type_id } = match.params;
  const { t } = useTranslation(['translation', 'revenue', 'common']);
  const dispatch = useDispatch();
  const selectedCustomRevenueType = useSelector(revenueTypeByIdSelector(Number(revenue_type_id)));
  const revenueTypes = useSelector(allRevenueTypesSelector);
  const { revenue_name, crop_generated, custom_description, farm_id, revenue_translation_key } =
    selectedCustomRevenueType;
  const translatedCustomDescription = farm_id
    ? custom_description
    : t(`revenue:${revenue_translation_key}.CUSTOM_DESCRIPTION`);
  const revenueTypesWithoutSelectedType = revenueTypes.filter((type) => {
    return revenue_type_id != type.revenue_type_id;
  });
  const translatedRevenueName = farm_id
    ? revenue_name
    : t(`revenue:${revenue_translation_key}.REVENUE_NAME`);

  const handleGoBack = () => {
    history.back();
  };

  const onSubmit = (payload) => {
    dispatch(updateCustomRevenueType({ ...payload, revenue_type_id: Number(revenue_type_id) }));
  };

  return (
    <HookFormPersistProvider>
      <PureSimpleCustomType
        handleGoBack={handleGoBack}
        onSubmit={onSubmit}
        view="edit"
        buttonText={t('common:SAVE')}
        pageTitle={t('REVENUE.ADD_REVENUE.CUSTOM_REVENUE_TYPE')}
        inputLabel={t('REVENUE.ADD_REVENUE.CUSTOM_REVENUE_NAME')}
        descriptionLabel={t('REVENUE.CUSTOM_REVENUE_DESCRIPTION')}
        nameFieldRegisterName={CUSTOM_REVENUE_NAME}
        typeDetails={{ name: translatedRevenueName, description: translatedCustomDescription }}
        validateInput={hookFormUniquePropertyWithStatusValidation({
          objArr: revenueTypesWithoutSelectedType,
          property: 'revenue_name',
          status: 'deleted',
          messageTrue: t('REVENUE.ADD_REVENUE.DUPLICATE_NAME_RETIRED'),
          messageFalse: t('REVENUE.ADD_REVENUE.DUPLICATE_NAME'),
        })}
        customFormFields={({ control, watch }) => (
          <CustomRevenueRadios control={control} watch={watch} view="edit" />
        )}
        customFieldsDefaultValues={{
          [CROP_GENERATED]: crop_generated,
        }}
      />
    </HookFormPersistProvider>
  );
}

export default EditCustomRevenue;
