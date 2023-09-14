import React, { useEffect } from 'react';
import moment from 'moment';
import { expenseSelector, expenseToDetailSelector, allExpenseTypeSelector } from '../selectors';
import { tempDeleteExpense, tempEditExpense } from '../actions';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import PureExpenseDetail from '../../../components/Finances/PureExpenseDetail';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { setPersistedPaths } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { updateExpense } from '../saga';

const ExpenseDetail = ({ history, match }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // used to returning to edit view via back/forwards
  const { historyCancel } = useHookFormPersist();

  const isEditing = match.path.endsWith('/edit');

  const { expense_id } = match.params;

  const expenseTypes = useSelector(allExpenseTypeSelector); // check this is what we want
  const expenses = useSelector(expenseSelector);

  const expense = expenses.find((record) => record.farm_expense_id === expense_id);

  useEffect(() => {
    if (!expense) {
      history.replace('/unknown_record');
    }
  }, [expense, history]);

  const expenseTypeReactSelectOptions = expenseTypes.map((type) => {
    return {
      value: type.expense_type_id,
      label: type.farm_id ? type.expense_name : t(`expense:${type.expense_translation_key}`),
    };
  });

  const handleSubmit = (formData) => {
    let data = {
      expense_date: moment(formData.date),
      expense_type_id: formData.type.value,
      note: formData.note,
      value: parseFloat(parseFloat(formData.value).toFixed(2)),
    };

    historyCancel();
    dispatch(updateExpense({ expense_id, data }));
  };

  const handleEdit = () => {
    dispatch(setPersistedPaths([`/expense/${expense_id}/edit`]));
    history.push(`/expense/${expense_id}/edit`);
  };

  const onRetire = () => {
    dispatch(tempDeleteExpense(expense_id));
  };

  const handleGoBack = () => {
    const unlisten = history.listen(() => {
      if (history.action === 'POP' && !isEditing) {
        unlisten();
        history.push('/other_expense');
      }
    });
    history.back();
  };

  return (
    expense && (
      <PureExpenseDetail
        pageTitle={isEditing ? t('EXPENSE.EDIT_EXPENSE.TITLE') : t('SALE.EXPENSE_DETAIL.TITLE')}
        expense={expense}
        handleGoBack={handleGoBack}
        onSubmit={isEditing ? handleSubmit : handleEdit}
        onRetire={onRetire}
        view={isEditing ? 'edit' : 'read-only'}
        buttonText={isEditing ? t('common:UPDATE') : t('common:EDIT')}
        expenseTypeReactSelectOptions={expenseTypeReactSelectOptions}
        useHookFormPersist={useHookFormPersist}
      />
    )
  );
};

export default ExpenseDetail;
