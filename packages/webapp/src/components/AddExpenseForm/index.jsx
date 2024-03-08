import { useTranslation } from 'react-i18next';
import AddExpense from '../../containers/Finances/NewExpense/AddExpense';
import ExpenseCategories from '../../containers/Finances/NewExpense/ExpenseCategories';
import { MultiStepForm } from '../Form/MultiStepForm';

export const AddExpenseForm = ({ history }) => {
  const { t } = useTranslation();
  return (
    <MultiStepForm
      history={history}
      steps={[
        {
          title: t('EXPENSE.ADD_EXPENSE.TITLE'),
          FormContent: ExpenseCategories,
        },
        {
          title: t('EXPENSE.ADD_EXPENSE.NEW_EXPENSE_ITEM'),
          FormContent: AddExpense,
        },
      ]}
      cancelModalTitle={t('EXPENSE.ADD_EXPENSE.FLOW')}
    />
  );
};
