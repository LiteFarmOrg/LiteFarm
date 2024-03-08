import { useTranslation } from 'react-i18next';
import AddExpense from '../../containers/Finances/NewExpense/AddExpense';
import ExpenseCategories from '../../containers/Finances/NewExpense/ExpenseCategories';
import { ADD_EXPENSE_URL, EXPENSE_CATEGORIES_URL } from '../../util/siteMapConstants';
import { MultiStepForm } from '../Form/MultiStepForm';

export const AddExpenseForm = ({ history }) => {
  const { t } = useTranslation();
  return (
    <MultiStepForm
      history={history}
      steps={[
        {
          route: EXPENSE_CATEGORIES_URL,
          title: t('EXPENSE.ADD_EXPENSE.TITLE'),
          FormContent: ExpenseCategories,
        },
        {
          route: ADD_EXPENSE_URL,
          title: t('EXPENSE.ADD_EXPENSE.NEW_EXPENSE_ITEM'),
          FormContent: AddExpense,
        },
      ]}
      cancelModalTitle={t('EXPENSE.ADD_EXPENSE.FLOW')}
    />
  );
};
