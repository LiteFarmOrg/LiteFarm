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
import { addCustomRevenueType } from '../saga';
import { allRevenueTypesSelector } from '../../revenueTypeSlice';
import { CUSTOM_REVENUE_NAME } from './constants';
import { hookFormUniquePropertyWithStatusValidation } from '../../../components/Form/hookformValidationUtils';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import CustomRevenueRadios from './CustomRevenueRadios';

function AddCustomRevenue({ history }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const revenueTypes = useSelector(allRevenueTypesSelector);

  const handleGoBack = () => {
    history.back();
  };

  const onSubmit = (payload) => {
    dispatch(addCustomRevenueType(payload));
  };

  return (
    <HookFormPersistProvider>
      <PureSimpleCustomType
        handleGoBack={handleGoBack}
        onSubmit={onSubmit}
        view="add"
        buttonText={t('common:SAVE')}
        pageTitle={t('REVENUE.ADD_REVENUE.ADD_CUSTOM_REVENUE')}
        inputLabel={t('REVENUE.ADD_REVENUE.CUSTOM_REVENUE_NAME')}
        descriptionLabel={t('REVENUE.CUSTOM_REVENUE_DESCRIPTION')}
        nameFieldRegisterName={CUSTOM_REVENUE_NAME}
        validateInput={hookFormUniquePropertyWithStatusValidation({
          objArr: revenueTypes,
          property: 'revenue_name',
          status: 'retired',
          messageStatusTrue: t('REVENUE.ADD_REVENUE.DUPLICATE_NAME_RETIRED'),
          messageStatusFalse: t('REVENUE.ADD_REVENUE.DUPLICATE_NAME'),
        })}
        customFormFields={({ control, watch }) => (
          <CustomRevenueRadios control={control} watch={watch} view="add" />
        )}
      />
    </HookFormPersistProvider>
  );
}

export default AddCustomRevenue;
