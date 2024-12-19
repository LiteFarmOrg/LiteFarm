import { addExpenses } from '../../actions';
import { userFarmSelector } from '../../../userFarmSlice';
import { useTranslation } from 'react-i18next';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureAddExpense from '../../../../components/Finances/AddExpense';
import { FINANCES_HOME_URL } from '../../../../util/siteMapConstants';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom-v5-compat';
import { expenseTypeSelector, selectedExpenseSelector } from '../../selectors';

const AddExpense = () => {
  let navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const expenseTypes = useSelector(expenseTypeSelector);
  const selectedExpense = useSelector(selectedExpenseSelector);
  const farm = useSelector(userFarmSelector);

  const getTypeName = (id) => {
    for (let { expense_type_id, expense_translation_key, farm_id, expense_name } of expenseTypes) {
      if (expense_type_id === id) {
        return farm_id ? expense_name : t(`expense:${expense_translation_key}.EXPENSE_NAME`);
      }
    }
    return 'NAME NOT FOUND';
  };

  let expenseNames = {};
  for (let s of selectedExpense) {
    expenseNames[s] = getTypeName(s);
  }

  const handleSubmit = (formData) => {
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
      dispatch(addExpenses(formattedData));
      navigate(FINANCES_HOME_URL);
    }
  };

  return (
    <HookFormPersistProvider>
      <PureAddExpense
        types={Object.keys(expenseNames).map((id) => ({ name: expenseNames[id], id }))}
        onGoBack={() => navigate(-1)}
        onSubmit={handleSubmit}
      />
    </HookFormPersistProvider>
  );
};

export default AddExpense;
