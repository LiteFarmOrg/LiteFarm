import { useEffect } from 'react';
import moment from 'moment';
import {
  expenseTypeTileContentsSelector,
  expenseTypeByIdSelector,
  expenseByIdSelector,
} from '../selectors';
import { deleteExpense } from '../actions';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import PureExpenseDetail from '../../../components/Finances/PureExpenseDetail';
import { setPersistedPaths } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { updateExpense } from '../saga';
import { createEditExpenseDetailsUrl } from '../../../util/siteMapConstants';
import { useLocation, useParams } from 'react-router-dom';

const ExpenseDetail = ({ history }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useHookFormPersist(); // To clear form history after editing
  let location = useLocation();
  const isEditing = location.pathname.endsWith('/edit');

  let { expense_id } = useParams();

  const sortedExpenseTypes = useSelector(expenseTypeTileContentsSelector);
  const expense = useSelector(expenseByIdSelector(expense_id));

  useEffect(() => {
    if (!expense) {
      history.replace('/unknown_record');
    }
  }, [expense, history]);

  const currentExpenseType = useSelector(expenseTypeByIdSelector(expense.expense_type_id));

  // Dropdown should include the current expense's type even if it has been retired
  const expenseTypeArray = sortedExpenseTypes.concat(
    currentExpenseType.retired ? currentExpenseType : [],
  );

  const expenseTypeReactSelectOptions = expenseTypeArray.map((type) => {
    const retireSuffix = type.retired ? ` ${t('EXPENSE.EDIT_EXPENSE.RETIRED')}` : '';

    return {
      value: type.expense_type_id,
      label: type.farm_id
        ? type.expense_name + retireSuffix
        : t(`expense:${type.expense_translation_key}.EXPENSE_NAME`),
    };
  });

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
    dispatch(setPersistedPaths([createEditExpenseDetailsUrl(expense_id)]));
    history.push(createEditExpenseDetailsUrl(expense_id));
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
        buttonText={isEditing ? t('common:SAVE') : t('common:EDIT')}
        expenseTypeReactSelectOptions={expenseTypeReactSelectOptions}
      />
    )
  );
};

export default ExpenseDetail;
