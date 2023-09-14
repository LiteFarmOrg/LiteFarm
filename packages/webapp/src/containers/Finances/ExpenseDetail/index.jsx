import React, { useEffect } from 'react';
import moment from 'moment';
import { expenseSelector, allExpenseTypeSelector } from '../selectors';
import { deleteExpense } from '../actions';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import PureExpenseDetail from '../../../components/Finances/PureExpenseDetail';
import { setPersistedPaths } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { updateExpense } from '../saga';

const ExpenseDetail = ({ history, match }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useHookFormPersist(); // To clear form history after editing

  const isEditing = match.path.endsWith('/edit');

  const { expense_id } = match.params;

  const expenseTypes = useSelector(allExpenseTypeSelector);
  const expenses = useSelector(expenseSelector);

  const expense = expenses.find((record) => record.farm_expense_id === expense_id);

  useEffect(() => {
    if (!expense) {
      history.replace('/unknown_record');
    }
  }, [expense, history]);

  // Dropdown should include the current expense's type even if it has been retired
  // No other retired types should be shown
  const expenseTypeReactSelectOptions = expenseTypes
    .map((type) => {
      if (type.deleted && type.expense_type_id !== expense?.expense_type_id) {
        return null;
      } else {
        const retireSuffix = type.deleted ? ` ${t('EXPENSE.EDIT_EXPENSE.RETIRED')}` : '';

        return {
          value: type.expense_type_id,
          label: type.farm_id
            ? type.expense_name + retireSuffix
            : t(`expense:${type.expense_translation_key}`),
        };
      }
    })
    .filter(Boolean);

  const handleSubmit = (formData) => {
    let data = {
      expense_date: moment(formData.date),
      expense_type_id: formData.type.value,
      note: formData.note,
      value: parseFloat(parseFloat(formData.value).toFixed(2)),
    };

    dispatch(updateExpense({ expense_id, data }));
  };

  const handleEdit = () => {
    dispatch(setPersistedPaths([`/expense/${expense_id}/edit`]));
    history.push(`/expense/${expense_id}/edit`);
  };

  const onRetire = () => {
    dispatch(deleteExpense(expense_id));
  };

  const handleGoBack = () => {
    history.back();
  };

  return (
    expense && (
      <PureExpenseDetail
        key={isEditing ? 'editing' : 'readonly'} // remount the component
        pageTitle={isEditing ? t('EXPENSE.EDIT_EXPENSE.TITLE') : t('SALE.EXPENSE_DETAIL.TITLE')}
        expense={expense}
        handleGoBack={handleGoBack}
        onSubmit={isEditing ? handleSubmit : handleEdit}
        onRetire={onRetire}
        view={isEditing ? 'edit' : 'read-only'}
        buttonText={isEditing ? t('common:UPDATE') : t('common:EDIT')}
        expenseTypeReactSelectOptions={expenseTypeReactSelectOptions}
      />
    )
  );
};

export default ExpenseDetail;
