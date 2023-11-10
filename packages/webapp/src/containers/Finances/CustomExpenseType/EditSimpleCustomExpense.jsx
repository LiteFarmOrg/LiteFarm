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
import { updateCustomExpenseType } from '../saga';
import { expenseTypeByIdSelector, allExpenseTypeSelector } from '../selectors';
import { CUSTOM_EXPENSE_NAME } from './constants';
import { hookFormUniquePropertyWithStatusValidation } from '../../../components/Form/hookformValidationUtils';

function EditCustomExpense({ history, match }) {
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
  const expenseTypes = useSelector(allExpenseTypeSelector);
  const expenseTypesWithoutSelectedType = expenseTypes.filter((type) => {
    return expense_type_id != type.expense_type_id;
  });

  const handleGoBack = () => {
    history.back();
  };

  const onSubmit = (payload) => {
    dispatch(updateCustomExpenseType({ ...payload, expense_type_id }));
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
        descriptionLabel={t('EXPENSE.CUSTOM_EXPENSE_DESCRIPTION')}
        nameFieldRegisterName={CUSTOM_EXPENSE_NAME}
        typeDetails={{ name: translatedExpenseName, description: translatedCustomDescription }}
        validateInput={hookFormUniquePropertyWithStatusValidation({
          objArr: expenseTypesWithoutSelectedType,
          property: 'expense_name',
          status: 'deleted',
          messageTrue: t('EXPENSE.ADD_EXPENSE.DUPLICATE_NAME_RETIRED'),
          messageFalse: t('EXPENSE.ADD_EXPENSE.DUPLICATE_NAME'),
        })}
      />
    </HookFormPersistProvider>
  );
}

export default EditCustomExpense;
