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
import { revenueTypesSelector } from '../../revenueTypeSlice';
import { CUSTOM_REVENUE_NAME, AGRICULTURE_ASSOCIATED, CROP_GENERATED } from './constants';
import { hookFormUniquePropertyValidation } from '../../../components/Form/hookformValidationUtils';

function AddCustomRevenue({ history }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const revenueTypes = useSelector(revenueTypesSelector);

  const handleGoBack = () => {
    history.back();
  };

  const onSubmit = (payload) => {
    dispatch(addCustomRevenueType(payload));
  };

  return (
    <PureSimpleCustomType
      handleGoBack={handleGoBack}
      onSubmit={onSubmit}
      view="add"
      buttonText={t('common:SAVE')}
      pageTitle={t('REVENUE.ADD_REVENUE.ADD_CUSTOM_REVENUE')}
      inputLabel={t('REVENUE.ADD_REVENUE.CUSTOM_REVENUE_NAME')}
      customTypeRegister={CUSTOM_REVENUE_NAME}
      validateInput={hookFormUniquePropertyValidation(
        revenueTypes,
        'revenue_name',
        t('REVENUE.ADD_REVENUE.DUPLICATE_NAME'),
      )}
      agricultureRadio={{
        name: AGRICULTURE_ASSOCIATED,
        defaultValue: undefined,
        text: t('REVENUE.ADD_REVENUE.ASSOCIATED_WITH_AGRICULTURE'),
        warning: t('REVENUE.ADD_REVENUE.CANNOT_BE_CHANGED'),
      }}
      cropGeneratedRadio={{
        name: CROP_GENERATED,
        defaultValue: undefined,
        text: t('REVENUE.ADD_REVENUE.CROP_GENERATED'),
        warning: t('REVENUE.ADD_REVENUE.CANNOT_BE_CHANGED'),
      }}
    />
  );
}

export default AddCustomRevenue;
