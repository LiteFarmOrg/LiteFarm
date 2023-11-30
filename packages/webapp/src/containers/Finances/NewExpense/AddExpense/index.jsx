import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import PureAddExpense from '../../../../components/Finances/AddExpense';
import { useGetNonRetiredExpenseTypesQuery } from '../../../../hooks/api/expenseTypesQueries';
import { useAddExpensesMutation } from '../../../../store/api/apiSlice';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../../../Snackbar/snackbarSlice';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { userFarmSelector } from '../../../userFarmSlice';
import { setSelectedExpenseTypes } from '../../actions';
import { selectedExpenseSelector } from '../../selectors';

const AddExpense = ({ history }) => {
  const [expenseNames, setExpenseNames] = useState({});
  const farm = useSelector(userFarmSelector);
  const selectedExpense = useSelector(selectedExpenseSelector);
  const { data: expenseTypes } = useGetNonRetiredExpenseTypesQuery();
  const { t } = useTranslation();
  const [addExpenses] = useAddExpensesMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    const newExpenseNames = {};
    for (let s of selectedExpense) {
      newExpenseNames[s] = getTypeName(s);
    }
    setExpenseNames(newExpenseNames);
  }, [selectedExpense]);

  const getTypeName = (id) => {
    for (let { expense_type_id, expense_translation_key, farm_id, expense_name } of expenseTypes) {
      if (expense_type_id === id) {
        return farm_id ? expense_name : t(`expense:${expense_translation_key}.EXPENSE_NAME`);
      }
    }
    return 'NAME NOT FOUND';
  };

  const handleSubmit = async (formData) => {
    const { expenseDetail } = formData;
    let formattedData = [];
    let expenseTypeIds = Object.keys(expenseDetail);
    let farm_id = farm.farm_id;

    let missingText = false;
    for (let expenseTypeId of expenseTypeIds) {
      let itemsOfExpenseType = expenseDetail[expenseTypeId];

      for (let expenseItem of itemsOfExpenseType) {
        if (expenseItem.note === '') {
          missingText = true;
        } else {
          let value = parseFloat(expenseItem.value.toFixed(2));

          const [year, month, day] = expenseItem.date.split('-');
          const expenseDate = new Date(+year, +month - 1, +day).toISOString();

          formattedData.push({
            farm_id,
            note: expenseItem.note,
            value: value,
            expense_type_id: expenseTypeId,
            expense_date: expenseDate,
          });
        }
      }
    }

    if (
      !missingText &&
      formattedData.length &&
      formattedData.filter((expense) => expense.value < 0 || isNaN(expense.value)).length === 0
    ) {
      try {
        await addExpenses({
          farmId: farm.farm_id,
          expenses: formattedData,
        }).unwrap();
        dispatch(enqueueSuccessSnackbar(t('message:EXPENSE.SUCCESS.ADD')));
        dispatch(setSelectedExpenseTypes([]));
        history.push('/finances');
      } catch (e) {
        console.log(e);
        dispatch(enqueueErrorSnackbar(t('message:EXPENSE.ERROR.ADD')));
      }
    }
  };

  return (
    <HookFormPersistProvider>
      <PureAddExpense
        types={Object.keys(expenseNames).map((id) => ({ name: expenseNames[id], id }))}
        onGoBack={history.back}
        onSubmit={handleSubmit}
      />
    </HookFormPersistProvider>
  );
};

export default AddExpense;
