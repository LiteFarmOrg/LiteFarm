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
import { retireCustomExpenseType } from '../saga';
import { expenseTypeByIdSelector } from '../selectors';
import { CUSTOM_EXPENSE_NAME } from './constants';

function ReadOnlyCustomExpense({ history, match }) {
  const expense_type_id = match.params.expense_type_id;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const selectedCustomExpenseType = useSelector(expenseTypeByIdSelector(expense_type_id));
  const { expense_name, custom_description, farm_id, expense_translation_key } =
    selectedCustomExpenseType;
  const translatedCustomDescription = farm_id
    ? custom_description
    : t(`expense:${expense_translation_key}.CUSTOM_DESCRIPTION`);
  const translatedExpenseName = farm_id
    ? expense_name
    : t(`expense:${expense_translation_key}.EXPENSE_NAME`);

  const handleGoBack = () => {
    history.back();
  };

  const handleEdit = () => {
    history.push(`/edit_custom_expense/${expense_type_id}`);
  };

  const onRetire = () => {
    dispatch(retireCustomExpenseType({ expense_type_id }));
  };

  return (
    <HookFormPersistProvider>
      <PureSimpleCustomType
        handleGoBack={handleGoBack}
        onClick={handleEdit}
        view="read-only"
        buttonText={t('common:EDIT')}
        pageTitle={t('EXPENSE.ADD_EXPENSE.CUSTOM_EXPENSE_TYPE')}
        inputLabel={t('EXPENSE.ADD_EXPENSE.CUSTOM_EXPENSE_NAME')}
        descriptionLabel={t('EXPENSE.CUSTOM_EXPENSE_DESCRIPTION')}
        nameFieldRegisterName={CUSTOM_EXPENSE_NAME}
        typeDetails={{ name: translatedExpenseName, description: translatedCustomDescription }}
        onRetire={onRetire}
        retireLinkText={t('EXPENSE.EDIT_EXPENSE.RETIRE_EXPENSE_TYPE')}
        retireHeader={t('EXPENSE.EDIT_EXPENSE.RETIRE_EXPENSE_TYPE')}
        retireMessage={t('EXPENSE.EDIT_EXPENSE.RETIRE_EXPENSE_MESSAGE')}
      />
    </HookFormPersistProvider>
  );
}

export default ReadOnlyCustomExpense;
