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
//TODO: make this saga
//import { updateExpenseType } from '../saga';
import useHookFormPersist from '../../hooks/useHookFormPersist';
//import { expenseTypeSelector } from '../selectors';
import { CUSTOM_EXPENSE_NAME } from './constants';

function EditCustomExpense({ history }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const onGoBackPath = '/add_expense/readonly_custom_expense';
  const persistedPaths = [onGoBackPath];
  const { persistedData } = useHookFormPersist();
  // const selectedCustomExpenseType = useSelector(expenseTypeSelector(persistedData.expense_type_id));
  // const { expense_name } = selectedCustomExpenseType;
  const expense_name = 'test name 123';

  const handleGoBack = () => {
    history.back();
  };

  const onSubmit = (payload) => {
    // dispatch(updateExpenseType(payload));
  };

  return (
    <HookFormPersistProvider>
      <PureSimpleCustomType
        handleGoBack={handleGoBack}
        onSubmit={onSubmit}
        view="edit"
        buttonText={t('common:SAVE')}
        pageTitle={t('EXPENSE.ADD_EXPENSE.CUSTOM_EXPENSE_TYPE')}
        inputLabel={t('EXPENSE.ADD_EXPENSE.CUSTOM_EXPENSE_NAME')}
        persistedPaths={persistedPaths}
        customTypeRegister={CUSTOM_EXPENSE_NAME}
        defaultValue={expense_name}
      />
    </HookFormPersistProvider>
  );
}

export default EditCustomExpense;
