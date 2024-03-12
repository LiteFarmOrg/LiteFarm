import { useTranslation } from 'react-i18next';
import AddExpense from '../../containers/Finances/NewExpense/AddExpense';
import ExpenseCategories from '../../containers/Finances/NewExpense/ExpenseCategories';
import { MultiStepForm } from '../Form/MultiStepForm';

export const STEPS = {
  EXPENSE_TYPES: 'ExpenseTypes',
  EXPENSE_DETAIL: 'ExpenseDetail',
};

export const AddExpenseForm = ({ history }) => {
  const { t } = useTranslation();
  return (
    <MultiStepForm
      history={history}
      steps={[
        {
          title: t('EXPENSE.ADD_EXPENSE.TITLE'),
          FormContent: ExpenseCategories,
          label: STEPS.EXPENSE_TYPES,
        },
        {
          title: t('EXPENSE.ADD_EXPENSE.NEW_EXPENSE_ITEM'),
          FormContent: AddExpense,
          label: STEPS.EXPENSE_DETAIL,
        },
      ]}
      cancelModalTitle={t('EXPENSE.ADD_EXPENSE.FLOW')}
      defaultFormValues={{
        [STEPS.EXPENSE_TYPES]: [],
        [STEPS.EXPENSE_DETAIL]: {},
      }}
    />
  );
};
