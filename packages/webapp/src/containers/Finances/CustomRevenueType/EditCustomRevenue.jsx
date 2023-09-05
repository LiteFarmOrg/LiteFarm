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
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { updateCustomRevenueType } from '../saga';
import { revenueTypeByIdSelector, revenueTypeSelector } from '../../revenueTypeSlice';
import { CUSTOM_REVENUE_NAME } from './constants';

function EditCustomExpense({ history, match }) {
  const { revenue_type_id } = match.params;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const onGoBackPath = `/readonly_custom_revenue/${revenue_type_id}`;
  const persistedPaths = [onGoBackPath];
  const selectedCustomRevenueType = useSelector(revenueTypeByIdSelector(revenue_type_id));
  const revenueTypes = useSelector(revenueTypeSelector);
  const { revenue_name } = selectedCustomRevenueType;

  const handleGoBack = () => {
    history.back();
  };

  const onSubmit = (payload) => {
    dispatch(updateCustomRevenueType(payload, revenue_type_id));
  };

  const validateUniqueTypeName = (value) => {
    const revenueNameExists = revenueTypes.some((type) => {
      return type.revenue_name === value;
    });

    if (revenueNameExists) {
      return t('REVENUE.ADD_REVENUE.DUPLICATE_NAME');
    }
    return true;
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
        persistedPaths={persistedPaths}
        customTypeRegister={CUSTOM_REVENUE_NAME}
        defaultValue={revenue_name}
        validateInput={validateUniqueTypeName}
      />
    </HookFormPersistProvider>
  );
}

export default EditCustomExpense;
