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
import { updateCustomExpenseType } from '../saga';
import { expenseTypeByIdSelector, expenseTypeSelector } from '../selectors';
import { CUSTOM_EXPENSE_NAME } from './constants';
import { hookFormUniquePropertyValidation } from '../../../components/Form/hookformValidationUtils';

function EditCustomExpense({ history, match }) {
  const expense_type_id = match.params.expense_type_id;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const selectedCustomExpenseType = useSelector(expenseTypeByIdSelector(expense_type_id));
  const { expense_name } = selectedCustomExpenseType;
  const expenseTypes = useSelector(expenseTypeSelector);

  const handleGoBack = () => {
    history.push(`/readonly_custom_expense/${expense_type_id}`);
  };

  const onSubmit = (payload) => {
    dispatch(updateCustomExpenseType({ ...payload, expense_type_id }));
  };

  return (
    <PureSimpleCustomType
      handleGoBack={handleGoBack}
      onSubmit={onSubmit}
      view="edit"
      buttonText={t('common:SAVE')}
      pageTitle={t('EXPENSE.ADD_EXPENSE.CUSTOM_EXPENSE_TYPE')}
      inputLabel={t('EXPENSE.ADD_EXPENSE.CUSTOM_EXPENSE_NAME')}
      customTypeRegister={CUSTOM_EXPENSE_NAME}
      defaultValue={expense_name}
      validateInput={hookFormUniquePropertyValidation(
        expenseTypes,
        'expense_name',
        t('EXPENSE.ADD_EXPENSE.DUPLICATE_NAME'),
      )}
    />
  );
}

export default EditCustomExpense;
