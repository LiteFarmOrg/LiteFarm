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
import { revenueTypeByIdSelector, revenueTypesSelector } from '../../revenueTypeSlice';
import { CUSTOM_REVENUE_NAME, AGRICULTURE_ASSOCIATED, CROP_GENERATED } from './constants';
import { hookFormUniquePropertyValidation } from '../../../components/Form/hookformValidationUtils';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import CustomRevenueRadios from './CustomRevenueRadios';

function EditCustomExpense({ history, match }) {
  const { revenue_type_id } = match.params;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const selectedCustomRevenueType = useSelector(revenueTypeByIdSelector(Number(revenue_type_id)));
  const revenueTypes = useSelector(revenueTypesSelector);
  const { revenue_name, agriculture_associated, crop_generated } = selectedCustomRevenueType;

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
        customTypeRegister={CUSTOM_REVENUE_NAME}
        defaultValue={revenue_name}
        validateInput={hookFormUniquePropertyValidation(
          revenueTypes,
          'revenue_name',
          t('REVENUE.ADD_REVENUE.DUPLICATE_NAME'),
        )}
        customFormFields={({ control, watch }) => (
          <CustomRevenueRadios control={control} watch={watch} view="edit" />
        )}
        customFieldsDefaultValues={{
          [AGRICULTURE_ASSOCIATED]: agriculture_associated,
          [CROP_GENERATED]: crop_generated,
        }}
      />
    </HookFormPersistProvider>
  );
}

export default EditCustomExpense;
